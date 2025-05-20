
import { DashboardStats } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";

interface ReportSummaryProps {
  stats: DashboardStats;
}

export function ReportSummary({ stats }: ReportSummaryProps) {
  const { incomeTotal, expenseTotal } = stats;
  const balance = incomeTotal - expenseTotal;
  const savingsRate = balance > 0 ? (balance / incomeTotal) * 100 : 0;
  const expenseRate = incomeTotal > 0 ? (expenseTotal / incomeTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Receitas Totais</p>
        <div className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
          <span className="text-2xl font-bold text-sob-green">
            {formatCurrency(incomeTotal)}
          </span>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-1">Despesas Totais</p>
        <div className="flex items-center">
          <TrendingDown className="mr-2 h-5 w-5 text-destructive" />
          <span className="text-2xl font-bold text-destructive">
            {formatCurrency(expenseTotal)}
          </span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground mb-1">Saldo do Período</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? "text-sob-green" : "text-destructive"}`}>
          {formatCurrency(balance)}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Taxa de Economia</p>
          <p className="text-xl font-medium text-sob-green">{formatPercentage(savingsRate)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Taxa de Gasto</p>
          <p className="text-xl font-medium text-destructive">{formatPercentage(expenseRate)}</p>
        </div>
      </div>
    </div>
  );
}
