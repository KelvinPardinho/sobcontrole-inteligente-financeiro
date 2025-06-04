
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "@/components/ReportFilters";
import { ReportSummary } from "@/components/ReportSummary";
import { ReportCharts } from "@/components/ReportCharts";
import { useReports } from "@/hooks/useReports";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const [reportType, setReportType] = useState<"monthly" | "category" | "comparison">("monthly");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const { data: reportData, isLoading, error } = useReports(dateRange);

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.dateRange) {
      setDateRange(newFilters.dateRange);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Erro ao carregar relatórios: {error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : reportData ? (
                      <ReportSummary 
                        stats={{
                          balance: reportData.balance,
                          incomeTotal: reportData.totalIncome,
                          expenseTotal: reportData.totalExpenses,
                          categorySummary: reportData.transactionsByCategory.reduce((acc, cat) => {
                            acc[cat.categoryName] = cat.amount;
                            return acc;
                          }, {} as Record<string, number>),
                          upcomingExpenses: 0 // TODO: Implementar despesas futuras
                        }}
                      />
                    ) : null}
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[400px] w-full" />
                    ) : reportData ? (
                      <ReportCharts type="monthly" data={reportData} />
                    ) : null}
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
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : reportData ? (
                    <ReportCharts type="category" data={reportData} />
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação entre Períodos</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : reportData ? (
                    <ReportCharts type="comparison" data={reportData} />
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
