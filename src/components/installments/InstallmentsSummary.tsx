
import { Transaction } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type InstallmentsSummaryProps = {
  installments: Transaction[];
};

export function InstallmentsSummary({ installments }: InstallmentsSummaryProps) {
  // Calculate total remaining amount
  const totalRemainingAmount = installments.reduce((total, transaction) => {
    if (!transaction.installment) return total;
    
    const { current, total: totalInstallments } = transaction.installment;
    const remainingInstallments = totalInstallments - current;
    const remainingAmount = transaction.amount * remainingInstallments;
    
    return total + remainingAmount;
  }, 0);

  // Calculate total paid amount
  const totalPaidAmount = installments.reduce((total, transaction) => {
    if (!transaction.installment) return total;
    
    const { current } = transaction.installment;
    const paidAmount = transaction.amount * current;
    
    return total + paidAmount;
  }, 0);

  // Calculate upcoming monthly payments
  // This is a simplification - in a real app you'd calculate based on due dates
  const nextMonthPayments = installments.reduce((total, transaction) => {
    if (!transaction.installment) return total;
    
    const { current, total: totalInstallments } = transaction.installment;
    if (current < totalInstallments) {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  // Prepare data for pie chart
  const chartData = [
    { name: "Pago", value: totalPaidAmount },
    { name: "A pagar", value: totalRemainingAmount },
  ];

  // Colors for the pie chart
  const COLORS = ["#10b981", "#f43f5e"];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Parcelas</CardTitle>
          <CardDescription>Visão geral das suas compras parceladas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardDescription>Total já pago</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold text-green-500">
                    R$ {totalPaidAmount.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardDescription>Total a pagar</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold text-rose-500">
                    R$ {totalRemainingAmount.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Próximo mês</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">
                  R$ {nextMonthPayments.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total de compras parceladas:</span>
              <span className="font-bold">{installments.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Parcelas restantes (todas):</span>
              <span className="font-bold">
                {installments.reduce((total, transaction) => {
                  if (!transaction.installment) return total;
                  const { current, total: totalInstallments } = transaction.installment;
                  return total + (totalInstallments - current);
                }, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Média por parcela:</span>
              <span className="font-bold">
                R$ {(nextMonthPayments / installments.filter(t => 
                  t.installment && t.installment.current < t.installment.total
                ).length || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
