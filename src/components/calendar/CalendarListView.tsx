
import { Transaction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getUpcomingTransactions } from "./CalendarUtils";

interface CalendarListViewProps {
  transactions: Transaction[];
}

export function CalendarListView({ transactions }: CalendarListViewProps) {
  const upcomingTransactions = getUpcomingTransactions(transactions);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Próximas Transações</h2>
      
      {upcomingTransactions.map((transaction) => (
        <Card key={transaction.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {transaction.type === "income" ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    {transaction.installment && (
                      <span className="ml-2">
                        (Parcela {transaction.installment.current}/{transaction.installment.total})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`font-medium ${
                transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {upcomingTransactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Não há transações futuras cadastradas.
        </div>
      )}
    </div>
  );
}
