
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";
import { Plus } from "lucide-react";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { useTransactions } from "@/hooks/useTransactions";

export default function Transactions() {
  const { transactions, isLoading, addTransaction } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const handleAddTransaction = async (data: any) => {
    const success = await addTransaction(data);
    if (success) {
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
