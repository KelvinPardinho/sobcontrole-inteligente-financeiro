
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

type InstallmentsListProps = {
  installments: Transaction[];
};

export function InstallmentsList({ installments }: InstallmentsListProps) {
  const { getCategoryName, getCategoryColor } = useCategories();
  
  // Sort by date (most recent first)
  const sortedInstallments = [...installments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor Parcela</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInstallments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
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
                  <TableCell>
                    {format(new Date(transaction.date), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {current}/{total}
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-32">
                      <Progress value={progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {Math.round(progress)}% concluído
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>R$ {totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
