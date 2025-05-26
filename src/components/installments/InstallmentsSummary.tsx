
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Cards de resumo */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Total já pago</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl font-bold text-green-600">
            R$ {totalPaidAmount.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Total a pagar</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl font-bold text-rose-600">
            R$ {totalRemainingAmount.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Próximas parcelas</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl font-bold text-blue-600">
            R$ {nextMonthPayments.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Estatísticas</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Pagas:</span>
            <span className="font-bold text-green-600">{paidInstallments}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Pendentes:</span>
            <span className="font-bold text-red-600">{unpaidInstallments}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Total:</span>
            <span className="font-bold">{installments.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
