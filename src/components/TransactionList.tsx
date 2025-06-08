
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { getCategoryName } = useCategories();
  const { accounts } = useAccounts();
  const { updateTransaction } = useTransactions();

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return "Conta não encontrada";
    
    return account.lastFourDigits 
      ? `${account.name} **** ${account.lastFourDigits}`
      : account.name;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Conta/Cartão</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="w-12">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(new Date(transaction.date))}</TableCell>
                <TableCell>
                  {transaction.description}
                  {transaction.installment && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({transaction.installment.current}/{transaction.installment.total})
                    </span>
                  )}
                </TableCell>
                <TableCell>{getCategoryName(transaction.category)}</TableCell>
                <TableCell className="text-sm">{getAccountName(transaction.accountId)}</TableCell>
                <TableCell className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"} className={`
                    ${transaction.type === "income" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                  `}>
                    {transaction.type === "income" ? "Receita" : "Despesa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <EditTransactionDialog 
                    transaction={transaction}
                    onTransactionUpdated={updateTransaction}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
