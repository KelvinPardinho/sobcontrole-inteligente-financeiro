
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

  // Buscar transações do usuário
  useEffect(() => {
    if (session?.user) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Buscar transações do usuário atual
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) {
        throw transactionsError;
      }

      // Calcular estatísticas
      let incomeTotal = 0;
      let expenseTotal = 0;
      const categorySummary: Record<string, number> = {};
      const upcomingExpenses = calculateUpcomingExpenses(transactionsData || []);

      if (transactionsData) {
        transactionsData.forEach(transaction => {
          if (transaction.type === 'income') {
            incomeTotal += Number(transaction.amount);
          } else {
            expenseTotal += Number(transaction.amount);
            
            // Buscar nome da categoria
            const categoryName = getCategoryName(transaction.category_id);
            if (categoryName) {
              if (categorySummary[categoryName]) {
                categorySummary[categoryName] += Number(transaction.amount);
              } else {
                categorySummary[categoryName] = Number(transaction.amount);
              }
            }
          }
        });

        // Formatar transações para o componente
        const formattedTransactions: Transaction[] = transactionsData.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
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

        setTransactions(formattedTransactions);
        setStats({
          balance: incomeTotal - expenseTotal,
          incomeTotal,
          expenseTotal,
          categorySummary,
          upcomingExpenses,
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
    // Considera despesas recorrentes e parcelas futuras
    // Por enquanto retornamos um valor simples
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(currentDate.getMonth() + 1);
    
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= nextMonth && new Date(t.date) > currentDate)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getCategoryName = (categoryId: string): string => {
    // Em uma implementação completa, buscaríamos da tabela de categorias
    // Por enquanto usamos um mapeamento simples
    const categories: Record<string, string> = {
      "1": "Alimentação",
      "2": "Transporte",
      "3": "Moradia",
      "4": "Educação",
      "5": "Lazer",
      "6": "Saúde",
      "7": "Salário",
      "8": "Investimentos",
    };
    
    return categories[categoryId] || "Outros";
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

      // Inserir no banco de dados
      const { data: insertedData, error } = await supabase
        .from('transactions')
        .insert([newTransactionData])
        .select();

      if (error) throw error;

      // Formatar transação para o estado
      if (insertedData && insertedData.length > 0) {
        const newTransaction: Transaction = {
          id: insertedData[0].id,
          type: insertedData[0].type,
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

        // Atualizar estado
        setTransactions([newTransaction, ...transactions]);
        
        // Atualizar estatísticas
        const updatedStats = { ...stats };
        
        if (data.type === 'income') {
          updatedStats.incomeTotal += data.amount;
          updatedStats.balance += data.amount;
        } else {
          updatedStats.expenseTotal += data.amount;
          updatedStats.balance -= data.amount;
          
          // Atualizar resumo de categorias
          const categoryName = getCategoryName(data.category);
          if (categoryName) {
            updatedStats.categorySummary[categoryName] = (updatedStats.categorySummary[categoryName] || 0) + data.amount;
          }
        }
        
        setStats(updatedStats);
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
