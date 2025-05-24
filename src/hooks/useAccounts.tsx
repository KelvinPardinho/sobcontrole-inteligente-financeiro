
import { useState, useEffect } from "react";
import { Account } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchAccounts();
    }
  }, [session]);

  const fetchAccounts = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching accounts for user:", session.user.id);
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching accounts:", error);
        throw error;
      }
      
      console.log("Raw accounts data from DB:", data);
      
      if (data) {
        const formattedAccounts: Account[] = data.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type as Account["type"],
          lastFourDigits: account.last_four_digits || undefined,
          color: account.color || undefined,
          balance: account.balance ? Number(account.balance) : undefined,
          limit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDay: account.due_day || undefined,
          closingDay: account.closing_day || undefined
        }));
        
        console.log("Formatted accounts:", formattedAccounts);
        setAccounts(formattedAccounts);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar contas: ${error.message}`);
      console.error("Erro ao buscar contas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async (accountData: Omit<Account, "id">) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Adding account:", accountData);
      
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: session.user.id,
          name: accountData.name,
          type: accountData.type,
          last_four_digits: accountData.lastFourDigits,
          color: accountData.color,
          balance: accountData.balance,
          credit_limit: accountData.limit,
          due_day: accountData.dueDay,
          closing_day: accountData.closingDay
        }])
        .select()
        .single();

      if (error) {
        console.error("Error adding account:", error);
        throw error;
      }

      console.log("Account added successfully:", data);
      toast.success("Conta adicionada com sucesso!");
      
      // Refresh accounts list
      await fetchAccounts();
    } catch (error: any) {
      toast.error(`Erro ao adicionar conta: ${error.message}`);
      console.error("Erro ao adicionar conta:", error);
    }
  };

  return {
    accounts,
    isLoading,
    fetchAccounts,
    addAccount
  };
};
