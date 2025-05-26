
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Transaction } from "@/types";
import { CalendarView } from "@/components/CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { RecentTransactions } from "@/components/RecentTransactions";
import { toast } from "@/components/ui/sonner";

// Mock data com accountId obrigatório
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "expense",
    amount: 125.0,
    date: "2023-06-01",
    description: "Supermercado",
    category: "1",
    accountId: "mock-account-1",
  },
  {
    id: "2",
    type: "expense",
    amount: 200.0,
    date: "2023-06-05",
    description: "Aluguel",
    category: "3",
    accountId: "mock-account-2",
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
    accountId: "mock-account-1",
  },
  {
    id: "4",
    type: "expense",
    amount: 89.9,
    date: "2023-06-15",
    description: "Internet",
    category: "3",
    accountId: "mock-account-2",
  },
  {
    id: "5",
    type: "expense",
    amount: 45.0,
    date: "2023-06-20",
    description: "Uber",
    category: "2",
    accountId: "mock-account-3",
  },
  {
    id: "6",
    type: "expense",
    amount: 200.0,
    date: "2023-07-05",
    description: "Aluguel",
    category: "3",
    accountId: "mock-account-2",
    installment: {
      current: 7,
      total: 12,
    },
  },
  {
    id: "7",
    type: "expense",
    amount: 89.9,
    date: "2023-07-15",
    description: "Internet",
    category: "3",
    accountId: "mock-account-2",
  },
  {
    id: "8",
    type: "income",
    amount: 3500.0,
    date: "2023-07-10",
    description: "Salário",
    category: "7",
    accountId: "mock-account-1",
  },
  {
    id: "9",
    type: "income",
    amount: 1200.0,
    date: "2023-06-25",
    description: "Freelance",
    category: "7",
    accountId: "mock-account-1",
  }
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list" | "year">("month");

  const getTransactionsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    return transactions.filter(transaction => {
      const transDate = new Date(transaction.date);
      return transDate.getDate() === selectedDate.getDate() && 
             transDate.getMonth() === selectedDate.getMonth() && 
             transDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: `${Date.now()}`,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      accountId: data.accountId || "mock-account-1", // Garantindo que tenha accountId
      ...(data.installments > 1 && {
        installment: {
          current: 1,
          total: data.installments,
        },
      }),
    };

    setTransactions([newTransaction, ...transactions]);
    toast(`${data.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
  };

  // Set up the global function for adding transactions from the calendar
  window.addCalendarTransaction = handleAddTransaction;

  const selectedDateTransactions = getTransactionsForSelectedDate();

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Calendário Financeiro</h1>
          <Tabs defaultValue={viewMode} className="w-[400px]" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 lg:col-span-2">
            <CalendarView 
              transactions={transactions} 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              viewMode={viewMode}
            />
          </Card>
          
          {viewMode !== "list" && (
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">
                {selectedDate && `Transações de ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`}
              </h2>
              {selectedDateTransactions.length > 0 ? (
                <RecentTransactions transactions={selectedDateTransactions} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Sem transações para esta data.
                  <p className="mt-2 text-sm">
                    Dica: Dê um clique duplo em um dia no calendário para adicionar uma transação.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
