import { useState, useEffect } from "react";
import { Transaction, DashboardStats } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    incomeTotal: 0,
    expenseTotal: 0,
    categorySummary: {},
    upcomingExpenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
      fetchTransactions();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      
      if (data) {
        const categoryMapping: Record<string, string> = {};
        data.forEach(category => {
          categoryMapping[category.id] = category.name;
        });
        setCategoriesMap(categoryMapping);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching transactions for user:", session?.user.id);
      
      // Buscar transações do usuário atual
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        throw transactionsError;
      }

      console.log("Transactions data from DB:", transactionsData);

      // Calcular estatísticas
      let incomeTotal = 0;
      let expenseTotal = 0;
      const categorySummary: Record<string, number> = {};
      
      if (transactionsData) {
        // Process transactions for statistics
        transactionsData.forEach(transaction => {
          if (transaction.type === 'income') {
            incomeTotal += Number(transaction.amount);
          } else {
            expenseTotal += Number(transaction.amount);
            
            const categoryName = getCategoryName(transaction.category_id);
            if (categoryName) {
              categorySummary[categoryName] = (categorySummary[categoryName] || 0) + Number(transaction.amount);
            }
          }
        });

        // Format transactions for component state
        const formattedTransactions: Transaction[] = transactionsData.map(transaction => ({
          id: transaction.id,
          type: transaction.type as 'income' | 'expense',
          amount: Number(transaction.amount),
          date: transaction.date,
          description: transaction.description,
          category: transaction.category_id,
          accountId: transaction.account_id,
          ...(transaction.installment_total && transaction.installment_current && {
            installment: {
              current: transaction.installment_current,
              total: transaction.installment_total
            },
          }),
        }));

        console.log("Formatted transactions:", formattedTransactions);

        // Update state with transactions and calculated stats
        setTransactions(formattedTransactions);
        setStats({
          balance: incomeTotal - expenseTotal,
          incomeTotal,
          expenseTotal,
          categorySummary,
          upcomingExpenses: calculateUpcomingExpenses(transactionsData),
        });
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar dados: ${error.message}`);
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateUpcomingExpenses = (transactions: any[]): number => {
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(currentDate.getMonth() + 1);
    
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= nextMonth && new Date(t.date) > currentDate)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getCategoryName = (categoryId: string): string => {
    return categoriesMap[categoryId] || "Outros";
  };

  const getImportCategoryId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', session?.user.id)
        .eq('name', 'Importação')
        .single();
      
      if (error) {
        console.error("Erro ao buscar categoria Importação:", error);
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error("Erro ao buscar categoria Importação:", error);
      return null;
    }
  };

  const addTransaction = async (data: any) => {
    if (!session?.user) {
      toast.error("Você precisa estar autenticado para adicionar transações");
      return;
    }

    try {
      // Para compras parceladas, calcular o valor da parcela
      const installmentAmount = data.installments > 1 ? data.amount / data.installments : data.amount;
      
      // Preparar dados da transação
      const newTransactionData = {
        user_id: session.user.id,
        type: data.type,
        amount: installmentAmount, // Valor da parcela (total dividido pelas parcelas)
        date: data.date,
        description: data.description,
        category_id: data.category,
        account_id: data.accountId,
        installment_total: data.installments > 1 ? data.installments : null,
        installment_current: data.installments > 1 ? 1 : null,
      };

      console.log("Enviando transação para o banco:", newTransactionData);
      console.log("Valor total da compra:", data.amount);
      console.log("Número de parcelas:", data.installments);
      console.log("Valor por parcela:", installmentAmount);

      // Inserir no banco de dados
      const { data: insertedData, error } = await supabase
        .from('transactions')
        .insert([newTransactionData])
        .select();

      if (error) throw error;

      // Update UI with new transaction
      if (insertedData && insertedData.length > 0) {
        toast.success("Transação adicionada com sucesso!");
        
        // After successful insert, refresh all transaction data
        await fetchTransactions();
        
        // Trigger accounts refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('accountsNeedRefresh'));
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast.error(`Erro ao adicionar transação: ${error.message}`);
      console.error("Erro ao adicionar transação:", error);
      return false;
    }
  };

  const updateTransaction = async (transactionId: string, data: any) => {
    if (!session?.user) {
      toast.error("Você precisa estar autenticado para atualizar transações");
      return false;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          type: data.type,
          amount: data.amount,
          date: data.date,
          description: data.description,
          category_id: data.category,
          account_id: data.accountId,
        })
        .eq('id', transactionId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success("Transação atualizada com sucesso!");
      await fetchTransactions();
      window.dispatchEvent(new CustomEvent('accountsNeedRefresh'));
      return true;
    } catch (error: any) {
      toast.error(`Erro ao atualizar transação: ${error.message}`);
      console.error("Erro ao atualizar transação:", error);
      return false;
    }
  };

  const importTransactions = async (transactions: any[], selectedAccountId: string, defaultCategoryId?: string) => {
    if (!session?.user) {
      toast.error("Você precisa estar autenticado para importar transações");
      return false;
    }

    try {
      // Buscar o ID da categoria "Importação"
      const importCategoryId = await getImportCategoryId();
      
      if (!importCategoryId) {
        toast.error("Categoria 'Importação' não encontrada. Tente recarregar a página.");
        return false;
      }

      // Preparar transações para inserção
      const transactionsData = transactions.map(transaction => ({
        user_id: session.user.id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        category_id: importCategoryId, // Usar a categoria "Importação"
        account_id: selectedAccountId,
      }));

      console.log("Importando transações:", transactionsData);

      // Inserir todas as transações de uma vez
      const { data: insertedData, error } = await supabase
        .from('transactions')
        .insert(transactionsData)
        .select();

      if (error) throw error;

      if (insertedData && insertedData.length > 0) {
        toast.success(`${insertedData.length} transações importadas com sucesso!`);
        
        // Atualizar dados após importação
        await fetchTransactions();
        
        // Trigger accounts refresh
        window.dispatchEvent(new CustomEvent('accountsNeedRefresh'));
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast.error(`Erro ao importar transações: ${error.message}`);
      console.error("Erro ao importar transações:", error);
      return false;
    }
  };

  return {
    transactions,
    stats,
    isLoading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    importTransactions
  };
};
