
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [categoriesMap, setCategoriesMap] = useState<Record<string, { name: string, color: string }>>({});
  const { session } = useAuth();
  
  // Buscar categorias do usuário
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.user) return;
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, color')
          .eq('user_id', session.user.id);
        
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
  }, [session]);

  const getCategoryName = (categoryId: string): string => {
    return categoriesMap[categoryId]?.name || "Outros";
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
