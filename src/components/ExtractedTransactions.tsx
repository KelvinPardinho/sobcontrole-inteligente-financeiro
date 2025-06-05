
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Edit } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";

interface ExtractedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface ExtractedTransactionsProps {
  transactions: ExtractedTransaction[];
  onConfirm: (transactions: ExtractedTransaction[]) => void;
  onCancel: () => void;
}

export function ExtractedTransactions({ 
  transactions: initialTransactions, 
  onConfirm, 
  onCancel 
}: ExtractedTransactionsProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set(Array.from({ length: initialTransactions.length }, (_, i) => i))
  );

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const updateTransaction = (index: number, updatedTransaction: ExtractedTransaction) => {
    const newTransactions = [...transactions];
    newTransactions[index] = updatedTransaction;
    setTransactions(newTransactions);
  };

  const handleConfirm = () => {
    const selectedTxs = transactions.filter((_, index) => selectedTransactions.has(index));
    onConfirm(selectedTxs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Extraídas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revise as transações extraídas e selecione quais deseja importar
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Importar</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-12">Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTransaction(index)}
                      className={selectedTransactions.has(index) ? "text-green-600" : "text-gray-400"}
                    >
                      {selectedTransactions.has(index) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(new Date(transaction.date))}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.type === "income" ? "default" : "destructive"}
                      className={transaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <TransactionForm
                          onSubmit={(data) => {
                            updateTransaction(index, {
                              type: data.type,
                              amount: parseFloat(data.amount),
                              description: data.description,
                              date: data.date
                            });
                          }}
                          initialData={{
                            type: transaction.type,
                            amount: transaction.amount.toString(),
                            description: transaction.description,
                            date: transaction.date
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedTransactions.size} de {transactions.length} transações selecionadas
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={selectedTransactions.size === 0}
                className="bg-sob-blue hover:bg-sob-blue/90"
              >
                Importar {selectedTransactions.size} Transações
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
