
import { DashboardStats } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface DashboardSummaryProps {
  stats: DashboardStats;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#A367DC", "#FFA500", "#45B7D1", "#38E54D"];

export function DashboardSummary({ stats }: DashboardSummaryProps) {
  const { balance, incomeTotal, expenseTotal, categorySummary, upcomingExpenses } = stats;

  // Transform category summary to chart data
  const chartData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate upcoming expense percentage of total balance
  const upcomingPercentage = balance > 0 ? (upcomingExpenses / balance) * 100 : 0;

  const totalMovements = incomeTotal + expenseTotal;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle>Visão Geral</CardTitle>
          <CardDescription>Resumo do seu mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Saldo atual
              </p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-sob-green' : 'text-destructive'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Receitas
              </p>
              <p className="text-2xl font-bold text-sob-green">
                {formatCurrency(incomeTotal)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Despesas
              </p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(expenseTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das suas despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(name) => `Categoria: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>Comparação do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Receitas</p>
                <p className="text-sm font-medium">{formatCurrency(incomeTotal)}</p>
              </div>
              <Progress
                value={totalMovements > 0 ? (incomeTotal / totalMovements) * 100 : 0}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-sob-green"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Despesas</p>
                <p className="text-sm font-medium">{formatCurrency(expenseTotal)}</p>
              </div>
              <Progress
                value={totalMovements > 0 ? (expenseTotal / totalMovements) * 100 : 0}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-destructive"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Despesas</CardTitle>
          <CardDescription>Previsão para os próximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valor previsto
                </p>
                <p className="text-xl font-bold text-orange-500">
                  {formatCurrency(upcomingExpenses)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {upcomingPercentage.toFixed(0)}% do saldo
              </p>
            </div>
            <Progress
              value={Math.min(upcomingPercentage, 100)}
              className="h-2 bg-gray-200"
              indicatorClassName="bg-orange-400"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
