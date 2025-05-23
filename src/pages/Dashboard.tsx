
import { useState, useEffect } from "react";
import { MainNav } from "@/components/MainNav";
import { TransactionForm } from "@/components/TransactionForm";
import { DashboardSummary } from "@/components/DashboardSummary";
import { RecentTransactions } from "@/components/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Transaction, DashboardStats } from "@/types";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FooterSection } from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    incomeTotal: 0,
    expenseTotal: 0,
    categorySummary: {},
    upcomingExpenses: 0,
  });
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

  // Fetch transactions when user session is available
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
      
      // Buscar transações do usuário atual
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        throw transactionsError;
      }

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
          ...(transaction.installment_total && transaction.installment_current && {
            installment: {
              current: transaction.installment_current,
              total: transaction.installment_total
            },
          }),
        }));

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

  const handleAddTransaction = async (data: any) => {
    if (!session?.user) {
      toast.error("Você precisa estar autenticado para adicionar transações");
      return;
    }

    try {
      // Preparar dados da transação
      const newTransactionData = {
        user_id: session.user.id,
        type: data.type,
        amount: data.amount,
        date: data.date,
        description: data.description,
        category_id: data.category,
        installment_total: data.installments > 1 ? data.installments : null,
        installment_current: data.installments > 1 ? 1 : null,
      };

      console.log("Enviando transação para o banco:", newTransactionData);

      // Inserir no banco de dados
      const { data: insertedData, error } = await supabase
        .from('transactions')
        .insert([newTransactionData])
        .select();

      if (error) throw error;

      // Update UI with new transaction
      if (insertedData && insertedData.length > 0) {
        const newTransaction: Transaction = {
          id: insertedData[0].id,
          type: insertedData[0].type as 'income' | 'expense',
          amount: Number(insertedData[0].amount),
          date: insertedData[0].date,
          description: insertedData[0].description,
          category: insertedData[0].category_id,
          ...(insertedData[0].installment_total && {
            installment: {
              current: insertedData[0].installment_current,
              total: insertedData[0].installment_total,
            },
          }),
        };

        // After successful insert, refresh all transaction data
        fetchTransactions();
        toast.success("Transação adicionada com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar transação: ${error.message}`);
      console.error("Erro ao adicionar transação:", error);
    } finally {
      setIsTransactionDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sob-blue hover:bg-sob-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <TransactionForm onSubmit={handleAddTransaction} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sob-blue"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <DashboardSummary stats={stats} />
            <RecentTransactions transactions={transactions} />
          </div>
        )}
      </main>
      
      <FooterSection />
    </div>
  );
}
