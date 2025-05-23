
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [categoriesMap, setCategoriesMap] = useState<Record<string, { name: string, color: string }>>({});
  
  // Buscar categorias do usuário
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, color');
        
        if (error) throw error;
        
        if (data) {
          const newCategoriesMap: Record<string, { name: string, color: string }> = {};
          data.forEach(category => {
            newCategoriesMap[category.id] = {
              name: category.name,
              color: category.color
            };
          });
          setCategoriesMap(newCategoriesMap);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchCategories();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const getCategoryColor = (categoryId: string) => {
    return categoriesMap[categoryId]?.color || "#8E9196";
  };

  const getCategoryName = (categoryId: string) => {
    return categoriesMap[categoryId]?.name || "Outros";
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
              {transactions.slice(0, 5).map((transaction) => (
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
