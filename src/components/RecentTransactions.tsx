
import { Transaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const getCategoryColor = (categoryId: string) => {
    // Simplified category ID to color mapping
    const colors: Record<string, string> = {
      "1": "#FF6B6B", // Alimentação
      "2": "#4ECDC4", // Transporte
      "3": "#45B7D1", // Moradia
      "4": "#A367DC", // Educação
      "5": "#FFA500", // Lazer
      "6": "#38E54D", // Saúde
      "7": "#00A76F", // Salário
      "8": "#6366F1", // Investimentos
    };
    
    return colors[categoryId] || "#8E9196";
  };

  const getCategoryName = (categoryId: string) => {
    // Simplified category ID to name mapping
    const names: Record<string, string> = {
      "1": "Alimentação",
      "2": "Transporte",
      "3": "Moradia",
      "4": "Educação",
      "5": "Lazer",
      "6": "Saúde",
      "7": "Salário",
      "8": "Investimentos",
    };
    
    return names[categoryId] || "Outros";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            Nenhuma transação registrada ainda
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.description}
                    {transaction.installment && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({transaction.installment.current}/{transaction.installment.total})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: getCategoryColor(transaction.category),
                        color: getCategoryColor(transaction.category),
                      }}
                    >
                      {getCategoryName(transaction.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "income"
                        ? "text-sob-green"
                        : "text-destructive"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
