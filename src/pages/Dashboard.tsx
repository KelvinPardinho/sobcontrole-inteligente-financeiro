
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { TransactionForm } from "@/components/TransactionForm";
import { DashboardSummary } from "@/components/DashboardSummary";
import { RecentTransactions } from "@/components/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FooterSection } from "@/components/FooterSection";
import { useTransactions } from "@/hooks/useTransactions";

export default function Dashboard() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const { transactions, stats, isLoading, addTransaction } = useTransactions();

  const handleAddTransaction = async (data: any) => {
    const success = await addTransaction(data);
    if (success) {
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
