
import { formatCurrency } from "@/lib/formatters";
import { ReportData } from "@/hooks/useReports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ReportChartsProps {
  type: "monthly" | "category" | "comparison";
  data: ReportData;
}

export function ReportCharts({ type, data }: ReportChartsProps) {
  // Cores para os gráficos
  const COLORS = ["#4ECDC4", "#FF6B6B", "#A367DC", "#FFA500", "#45B7D1", "#38E54D"];

  if (type === "monthly") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="income" fill="#4ECDC4" name="Receitas" />
            <Bar dataKey="expenses" fill="#FF6B6B" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "category") {
    const categoryData = data.transactionsByCategory.map(cat => ({
      name: cat.categoryName,
      valor: cat.amount,
      color: cat.color
    }));

    if (categoryData.length === 0) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhuma despesa encontrada no período selecionado</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
        <div>
          <h3 className="text-center mb-4 font-medium">Distribuição de Gastos por Categoria</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="valor"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-center mb-4 font-medium">Valor por Categoria</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `R$${value}`} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="valor" fill="#8884d8">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Comparação - ainda usando dados mock por enquanto
  const comparisonData = data.monthlyData.map((month, index) => ({
    name: month.month,
    "Período Atual": month.expenses,
    "Período Anterior": Math.max(0, month.expenses * (0.8 + Math.random() * 0.4)) // Mock data
  }));

  return (
    <div className="h-[400px]">
      <h3 className="text-center mb-4 font-medium">Comparativo de Despesas - Período Atual vs. Anterior</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${value}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="Período Atual" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Período Anterior" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
