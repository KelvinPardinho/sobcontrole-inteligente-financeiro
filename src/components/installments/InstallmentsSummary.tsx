
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
  // Calculate total remaining amount (only unpaid installments)
  const totalRemainingAmount = installments.reduce((total, transaction) => {
    if (!transaction.installment || transaction.installment.paid) return total;
    
    const { current, total: totalInstallments } = transaction.installment;
    const remainingInstallments = totalInstallments - current;
    const remainingAmount = transaction.amount * remainingInstallments;
    
    return total + remainingAmount;
  }, 0);

  // Calculate total paid amount
  const totalPaidAmount = installments.reduce((total, transaction) => {
    if (!transaction.installment) return total;
    
    const { current, paid } = transaction.installment;
    if (paid) {
      return total + transaction.amount; // Current installment paid
    } else {
      const paidInstallments = Math.max(0, current - 1); // Previous installments
      return total + (transaction.amount * paidInstallments);
    }
  }, 0);

  // Calculate upcoming monthly payments (unpaid installments)
  const nextMonthPayments = installments.reduce((total, transaction) => {
    if (!transaction.installment || transaction.installment.paid) return total;
    
    const { current, total: totalInstallments } = transaction.installment;
    if (current < totalInstallments) {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  // Count paid vs unpaid installments
  const paidInstallments = installments.filter(t => t.installment?.paid).length;
  const unpaidInstallments = installments.filter(t => !t.installment?.paid).length;

  // Prepare data for pie chart
  const chartData = [
    { name: "Pagas", value: paidInstallments },
    { name: "Pendentes", value: unpaidInstallments },
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
                <CardDescription>Próximas parcelas</CardDescription>
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
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Parcelas pagas:</span>
              <span className="font-bold text-green-600">{paidInstallments}</span>
            </div>
            <div className="flex justify-between">
              <span>Parcelas pendentes:</span>
              <span className="font-bold text-red-600">{unpaidInstallments}</span>
            </div>
            <div className="flex justify-between">
              <span>Total de compras parceladas:</span>
              <span className="font-bold">{installments.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Média por parcela pendente:</span>
              <span className="font-bold">
                R$ {unpaidInstallments > 0 ? (nextMonthPayments / unpaidInstallments).toFixed(2) : "0,00"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
