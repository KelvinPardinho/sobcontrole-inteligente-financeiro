
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/ReportFilters";
import { ReportSummary } from "@/components/ReportSummary";
import { ReportCharts } from "@/components/ReportCharts";
import { DashboardStats, Transaction } from "@/types";
import { DateRange } from "react-day-picker";

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

export default function Reports() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [stats] = useState<DashboardStats>(mockStats);
  const [reportType, setReportType] = useState<"monthly" | "category" | "comparison">("monthly");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const handleFilterChange = (newFilters: any) => {
    // Em uma aplicação real, aqui buscaríamos dados baseados nos filtros
    console.log("Filtros aplicados:", newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Relatórios</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportFilters onFilterChange={handleFilterChange} dateRange={dateRange} setDateRange={setDateRange} />
            </CardContent>
          </Card>

          <Tabs
            defaultValue="monthly"
            value={reportType}
            onValueChange={(value) => setReportType(value as any)}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-6">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="category">Categorias</TabsTrigger>
              <TabsTrigger value="comparison">Comparação</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Resumo do Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReportSummary stats={stats} />
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReportCharts type="monthly" transactions={transactions} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="category" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Análise por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportCharts type="category" transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação entre Períodos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportCharts type="comparison" transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
