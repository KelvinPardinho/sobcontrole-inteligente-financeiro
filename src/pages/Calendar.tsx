
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Transaction } from "@/types";
import { CalendarView } from "@/components/CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Mock data para demonstração
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
  // Adicionar algumas transações futuras para demonstrar o calendário
  {
    id: "6",
    type: "expense",
    amount: 200.0,
    date: "2023-07-05", // Próximo mês
    description: "Aluguel",
    category: "3",
    installment: {
      current: 7,
      total: 12,
    },
  },
  {
    id: "7",
    type: "expense",
    amount: 89.9,
    date: "2023-07-15", // Próximo mês
    description: "Internet",
    category: "3",
  }
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Calendário de Despesas</h1>
          <Tabs defaultValue="month" className="w-[400px]" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
            <CalendarView 
              transactions={transactions} 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              viewMode={viewMode}
            />
          </Card>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
