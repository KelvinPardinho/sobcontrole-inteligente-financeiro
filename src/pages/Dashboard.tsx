
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

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "expense",
    amount: 125.0,
    date: "2023-06-01",
    description: "Supermercado",
    category: "1",
  },
  {
    id: "2",
    type: "expense",
    amount: 200.0,
    date: "2023-06-05",
    description: "Aluguel",
    category: "3",
    installment: {
      current: 6,
      total: 12,
    },
  },
  {
    id: "3",
    type: "income",
    amount: 3500.0,
    date: "2023-06-10",
    description: "Salário",
    category: "7",
  },
  {
    id: "4",
    type: "expense",
    amount: 89.9,
    date: "2023-06-15",
    description: "Internet",
    category: "3",
  },
  {
    id: "5",
    type: "expense",
    amount: 45.0,
    date: "2023-06-20",
    description: "Uber",
    category: "2",
  },
];

const mockStats: DashboardStats = {
  balance: 3040.1,
  incomeTotal: 3500.0,
  expenseTotal: 459.9,
  categorySummary: {
    "Alimentação": 125.0,
    "Transporte": 45.0,
    "Moradia": 289.9,
  },
  upcomingExpenses: 1200.0,
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: `${transactions.length + 1}`,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      ...(data.installments > 1 && {
        installment: {
          current: 1,
          total: data.installments,
        },
      }),
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Update stats based on the new transaction
    const updatedStats = { ...stats };
    
    if (data.type === 'income') {
      updatedStats.incomeTotal += data.amount;
      updatedStats.balance += data.amount;
    } else {
      updatedStats.expenseTotal += data.amount;
      updatedStats.balance -= data.amount;
      
      // Update category summary
      const categoryName = getCategoryName(data.category);
      if (categoryName) {
        updatedStats.categorySummary[categoryName] = (updatedStats.categorySummary[categoryName] || 0) + data.amount;
      }
    }
    
    setStats(updatedStats);
    setIsTransactionDialogOpen(false);
  };

  const getCategoryName = (categoryId: string): string => {
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

        <div className="space-y-8">
          <DashboardSummary stats={stats} />
          <RecentTransactions transactions={transactions} />
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
