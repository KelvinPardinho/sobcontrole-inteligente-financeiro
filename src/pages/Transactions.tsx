
import { useState, useEffect } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";
import { Plus } from "lucide-react";
import { Transaction } from "@/types";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
    search: "",
  });
  const { session } = useAuth();

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

      if (transactionsData) {
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
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar transações: ${error.message}`);
      console.error("Erro ao buscar transações:", error);
    } finally {
      setIsLoading(false);
    }
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

        setTransactions([newTransaction, ...transactions]);
        toast.success("Transação adicionada com sucesso!");
      }
    } catch (error: any) {
      toast.error(`Erro ao adicionar transação: ${error.message}`);
      console.error("Erro ao adicionar transação:", error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Aplicar filtros às transações
  const filteredTransactions = transactions.filter((transaction) => {
    // Filtrar por tipo (receita/despesa)
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    
    // Filtrar por categoria
    if (filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }
    
    // Filtrar por texto (descrição)
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filtrar por data
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionFilters onFilterChange={handleFilterChange} />
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sob-blue"></div>
            </div>
          ) : (
            <TransactionList transactions={filteredTransactions} />
          )}
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
