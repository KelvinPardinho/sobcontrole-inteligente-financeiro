
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

  const calculateAccountBalance = async (accountId: string, initialBalance: number = 0) => {
    try {
      // Buscar todas as transações desta conta
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', session?.user.id);

      if (error) throw error;

      let balance = initialBalance;
      
      if (transactions) {
        transactions.forEach(transaction => {
          if (transaction.type === 'income') {
            balance += Number(transaction.amount);
          } else {
            // Para despesas, só deduzir se não for parcelado ou se for a primeira parcela
            if (!transaction.installment_total || transaction.installment_total <= 1) {
              balance -= Number(transaction.amount);
            } else {
              // Para compras parceladas, deduzir apenas o valor das parcelas já vencidas
              const purchaseDate = new Date(transaction.date);
              const today = new Date();
              const monthsElapsed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
              const paidInstallments = Math.min(Math.max(monthsElapsed + 1, 1), transaction.installment_total);
              
              if (transaction.installment_paid) {
                // Se marcado como pago, deduzir o valor total
                balance -= Number(transaction.amount) * transaction.installment_total;
              } else {
                // Se não pago, deduzir apenas as parcelas vencidas
                balance -= Number(transaction.amount) * paidInstallments;
              }
            }
          }
        });
      }

      return balance;
    } catch (error) {
      console.error("Erro ao calcular saldo:", error);
      return initialBalance;
    }
  };

  const calculateCreditCardUsage = async (accountId: string) => {
    try {
      // Buscar transações de cartão de crédito (despesas)
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', session?.user.id)
        .eq('type', 'expense');

      if (error) throw error;

      let totalUsed = 0;
      
      if (transactions) {
        transactions.forEach(transaction => {
          if (!transaction.installment_total || transaction.installment_total <= 1) {
            // Compra à vista
            totalUsed += Number(transaction.amount);
          } else {
            // Compra parcelada - somar apenas as parcelas futuras
            const purchaseDate = new Date(transaction.date);
            const today = new Date();
            const monthsElapsed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const currentInstallment = Math.min(Math.max(monthsElapsed + 1, 1), transaction.installment_total);
            
            if (currentInstallment <= transaction.installment_total && !transaction.installment_paid) {
              // Ainda há parcelas em aberto, incluir no limite usado
              const installmentAmount = Number(transaction.amount) / transaction.installment_total;
              const remainingInstallments = transaction.installment_total - (currentInstallment - 1);
              totalUsed += installmentAmount * remainingInstallments;
            }
          }
        });
      }

      return totalUsed;
    } catch (error) {
      console.error("Erro ao calcular uso do cartão:", error);
      return 0;
    }
  };

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
        const formattedAccounts: Account[] = await Promise.all(
          data.map(async (account) => {
            let calculatedBalance = account.balance ? Number(account.balance) : 0;
            let totalLimit = account.credit_limit ? Number(account.credit_limit) : 0;
            let availableLimit = totalLimit;

            if (account.type === 'credit_card') {
              // Para cartões de crédito, calcular limite disponível
              const usedAmount = await calculateCreditCardUsage(account.id);
              availableLimit = totalLimit - usedAmount;
              console.log(`Cartão ${account.name}: Limite total: ${totalLimit}, Usado: ${usedAmount}, Disponível: ${availableLimit}`);
            } else {
              // Para contas bancárias, calcular saldo atualizado
              calculatedBalance = await calculateAccountBalance(account.id, account.balance ? Number(account.balance) : 0);
            }

            return {
              id: account.id,
              name: account.name,
              type: account.type as Account["type"],
              lastFourDigits: account.last_four_digits || undefined,
              color: account.color || undefined,
              balance: calculatedBalance,
              limit: account.type === 'credit_card' ? availableLimit : account.credit_limit ? Number(account.credit_limit) : undefined,
              totalLimit: account.type === 'credit_card' ? totalLimit : undefined,
              dueDay: account.due_day || undefined,
              closingDay: account.closing_day || undefined
            };
          })
        );
        
        console.log("Formatted accounts with calculated balances:", formattedAccounts);
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

  const updateAccount = async (accountId: string, accountData: Omit<Account, "id">) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Updating account:", accountId, accountData);
      
      const { data, error } = await supabase
        .from('accounts')
        .update({
          name: accountData.name,
          type: accountData.type,
          last_four_digits: accountData.lastFourDigits,
          color: accountData.color,
          balance: accountData.balance,
          credit_limit: accountData.limit,
          due_day: accountData.dueDay,
          closing_day: accountData.closingDay
        })
        .eq('id', accountId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating account:", error);
        throw error;
      }

      console.log("Account updated successfully:", data);
      toast.success("Conta atualizada com sucesso!");
      
      // Refresh accounts list
      await fetchAccounts();
    } catch (error: any) {
      toast.error(`Erro ao atualizar conta: ${error.message}`);
      console.error("Erro ao atualizar conta:", error);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Deleting account:", accountId);
      
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Error deleting account:", error);
        throw error;
      }

      console.log("Account deleted successfully");
      toast.success("Conta excluída com sucesso!");
      
      // Refresh accounts list
      await fetchAccounts();
    } catch (error: any) {
      toast.error(`Erro ao excluir conta: ${error.message}`);
      console.error("Erro ao excluir conta:", error);
    }
  };

  return {
    accounts,
    isLoading,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount
  };
};
