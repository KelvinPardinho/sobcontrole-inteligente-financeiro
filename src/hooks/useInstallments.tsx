
import { useState, useEffect } from "react";
import { Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { addMonths, differenceInMonths, isAfter, startOfMonth } from "date-fns";

export const useInstallments = () => {
  const [installments, setInstallments] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchInstallments();
    }
  }, [session]);

  const fetchInstallments = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching installments for user:", session.user.id);
      
      // Buscar apenas transações com parcelas (installment_total > 1)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .not('installment_total', 'is', null)
        .gt('installment_total', 1)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching installments:", error);
        throw error;
      }
      
      console.log("Raw installments data from DB:", data);
      
      if (data) {
        // Formatar transações para o formato esperado com cálculo de progresso baseado em data
        const formattedInstallments: Transaction[] = data.map(transaction => {
          const purchaseDate = new Date(transaction.date);
          const today = new Date();
          const totalInstallments = transaction.installment_total || 1;
          
          // Calcular quantas parcelas já venceram baseado na diferença de meses
          const monthsElapsed = differenceInMonths(startOfMonth(today), startOfMonth(purchaseDate));
          const currentInstallment = Math.min(Math.max(monthsElapsed + 1, 1), totalInstallments);
          
          return {
            id: transaction.id,
            type: transaction.type as 'income' | 'expense',
            amount: Number(transaction.amount),
            date: transaction.date,
            description: transaction.description,
            category: transaction.category_id,
            accountId: transaction.account_id,
            installment: {
              current: currentInstallment,
              total: totalInstallments,
              paid: transaction.installment_paid || false
            }
          };
        });
        
        console.log("Formatted installments with calculated progress:", formattedInstallments);
        setInstallments(formattedInstallments);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar parcelas: ${error.message}`);
      console.error("Erro ao buscar parcelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markInstallmentAsPaid = async (transactionId: string, paid: boolean) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Marking installment as paid:", transactionId, paid);
      
      const { error } = await supabase
        .from('transactions')
        .update({
          installment_paid: paid
        })
        .eq('id', transactionId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Error updating installment payment status:", error);
        throw error;
      }

      console.log("Installment payment status updated successfully");
      toast.success(paid ? "Parcela marcada como paga!" : "Parcela desmarcada como paga!");
      
      // Refresh installments list
      await fetchInstallments();
      
      // Trigger accounts refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('accountsNeedRefresh'));
    } catch (error: any) {
      toast.error(`Erro ao atualizar status da parcela: ${error.message}`);
      console.error("Erro ao atualizar status da parcela:", error);
    }
  };

  return {
    installments,
    isLoading,
    fetchInstallments,
    markInstallmentAsPaid
  };
};
