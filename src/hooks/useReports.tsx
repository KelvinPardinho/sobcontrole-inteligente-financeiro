
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionsByCategory: Array<{
    categoryName: string;
    amount: number;
    color: string;
  }>;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export function useReports(dateRange?: { from: Date; to: Date }) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['reports', session?.user?.id, dateRange],
    queryFn: async (): Promise<ReportData> => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const startDate = dateRange?.from || startOfMonth(new Date());
      const endDate = dateRange?.to || endOfMonth(new Date());

      // Buscar transações do período
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .eq('user_id', session.user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (transactionsError) throw transactionsError;

      // Calcular totais
      const totalIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const balance = totalIncome - totalExpenses;

      // Agrupar por categoria
      const categoryMap = new Map();
      transactions?.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.categories) {
          const categoryName = transaction.categories.name;
          const categoryColor = transaction.categories.color;
          const currentAmount = categoryMap.get(categoryName)?.amount || 0;
          
          categoryMap.set(categoryName, {
            categoryName,
            amount: currentAmount + Number(transaction.amount),
            color: categoryColor
          });
        }
      });

      const transactionsByCategory = Array.from(categoryMap.values());

      // Dados mensais (últimos 6 meses)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        const monthTransactions = transactions?.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        }) || [];

        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        monthlyData.push({
          month: format(date, 'MMM'),
          income: monthIncome,
          expenses: monthExpenses
        });
      }

      return {
        totalIncome,
        totalExpenses,
        balance,
        transactionsByCategory,
        monthlyData
      };
    },
    enabled: !!session?.user?.id,
  });
}
