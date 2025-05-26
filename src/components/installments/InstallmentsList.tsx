
import { Transaction } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCategories } from "@/hooks/useCategories";
import { MonthlyInstallmentControl } from "./MonthlyInstallmentControl";

type InstallmentsListProps = {
  installments: Transaction[];
  onMarkAsPaid: (transactionId: string, paid: boolean) => void;
};

export function InstallmentsList({ installments, onMarkAsPaid }: InstallmentsListProps) {
  const { getCategoryName, getCategoryColor } = useCategories();
  
  // Sort by date (most recent first)
  const sortedInstallments = [...installments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Descrição</TableHead>
            <TableHead className="w-[120px]">Categoria</TableHead>
            <TableHead className="w-[100px]">Data Compra</TableHead>
            <TableHead className="w-[100px]">Valor Parcela</TableHead>
            <TableHead className="w-[80px]">Parcelas</TableHead>
            <TableHead className="w-[120px]">Progresso</TableHead>
            <TableHead className="w-[100px]">Valor Total</TableHead>
            <TableHead className="min-w-[300px]">Controle de Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInstallments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhuma compra parcelada encontrada
              </TableCell>
            </TableRow>
          ) : (
            sortedInstallments.map((transaction) => {
              const current = transaction.installment?.current || 0;
              const total = transaction.installment?.total || 1;
              const progress = (current / total) * 100;
              const totalAmount = transaction.amount * total;
              
              return (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: getCategoryColor(transaction.category),
                        color: getCategoryColor(transaction.category),
                      }}
                      className="text-xs"
                    >
                      {getCategoryName(transaction.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">R$ {transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{current}/{total}</span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-24">
                      <Progress value={progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">R$ {totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <MonthlyInstallmentControl
                      transaction={transaction}
                      onMarkAsPaid={onMarkAsPaid}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
