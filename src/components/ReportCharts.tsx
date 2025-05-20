
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/formatters";
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
  transactions: Transaction[];
}

export function ReportCharts({ type, transactions }: ReportChartsProps) {
  // Mock data para demonstração - em uma aplicação real, isso seria calculado a partir das transações
  const monthlyData = [
    { name: "Jan", receitas: 3500, despesas: 2800 },
    { name: "Fev", receitas: 3500, despesas: 2950 },
    { name: "Mar", receitas: 3700, despesas: 3100 },
    { name: "Abr", receitas: 3500, despesas: 2700 },
    { name: "Mai", receitas: 4500, despesas: 3200 },
    { name: "Jun", receitas: 3500, despesas: 2900 },
  ];

  const categoryData = [
    { name: "Alimentação", valor: 850 },
    { name: "Transporte", valor: 450 },
    { name: "Moradia", valor: 1200 },
    { name: "Educação", valor: 350 },
    { name: "Lazer", valor: 280 },
    { name: "Saúde", valor: 180 },
  ];

  const comparisonData = [
    {
      name: "Jan",
      "Ano Atual": 2800,
      "Ano Anterior": 2600,
    },
    {
      name: "Fev",
      "Ano Atual": 2950,
      "Ano Anterior": 2800,
    },
    {
      name: "Mar",
      "Ano Atual": 3100,
      "Ano Anterior": 2900,
    },
    {
      name: "Abr",
      "Ano Atual": 2700,
      "Ano Anterior": 3000,
    },
    {
      name: "Mai",
      "Ano Atual": 3200,
      "Ano Anterior": 2800,
    },
    {
      name: "Jun",
      "Ano Atual": 2900,
      "Ano Anterior": 3100,
    },
  ];

  // Cores para os gráficos
  const COLORS = ["#4ECDC4", "#FF6B6B", "#A367DC", "#FFA500", "#45B7D1", "#38E54D"];

  if (type === "monthly") {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="receitas" fill="#4ECDC4" name="Receitas" />
            <Bar dataKey="despesas" fill="#FF6B6B" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "category") {
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Comparação
  return (
    <div className="h-[400px]">
      <h3 className="text-center mb-4 font-medium">Comparativo de Despesas - Ano Atual vs. Anterior</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${value}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="Ano Atual" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Ano Anterior" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
