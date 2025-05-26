
import { useState, useEffect } from "react";
import { Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

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
        // Formatar transações para o formato esperado
        const formattedInstallments: Transaction[] = data.map(transaction => ({
          id: transaction.id,
          type: transaction.type as 'income' | 'expense',
          amount: Number(transaction.amount),
          date: transaction.date,
          description: transaction.description,
          category: transaction.category_id,
          accountId: transaction.account_id, // Adicionando o campo obrigatório
          installment: {
            current: transaction.installment_current || 1,
            total: transaction.installment_total || 1
          }
        }));
        
        console.log("Formatted installments:", formattedInstallments);
        setInstallments(formattedInstallments);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar parcelas: ${error.message}`);
      console.error("Erro ao buscar parcelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    installments,
    isLoading,
    fetchInstallments
  };
};
