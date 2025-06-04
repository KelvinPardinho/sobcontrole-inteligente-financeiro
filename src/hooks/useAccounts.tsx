
import { useState, useEffect } from "react";
import { Account } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { 
  fetchAccountsFromDB, 
  formatAccountData, 
  createAccount, 
  updateAccount, 
  deleteAccount 
} from "@/services/accountService";

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
      
      const data = await fetchAccountsFromDB(session.user.id);
      console.log("Raw accounts data from DB:", data);
      
      if (data) {
        const formattedAccounts = await formatAccountData(data, session.user.id);
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
      await createAccount(session.user.id, accountData);
      console.log("Account added successfully");
      toast.success("Conta adicionada com sucesso!");
      await fetchAccounts();
    } catch (error: any) {
      toast.error(`Erro ao adicionar conta: ${error.message}`);
      console.error("Erro ao adicionar conta:", error);
    }
  };

  const updateAccountData = async (accountId: string, accountData: Omit<Account, "id">) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Updating account:", accountId, accountData);
      await updateAccount(session.user.id, accountId, accountData);
      console.log("Account updated successfully");
      toast.success("Conta atualizada com sucesso!");
      await fetchAccounts();
    } catch (error: any) {
      toast.error(`Erro ao atualizar conta: ${error.message}`);
      console.error("Erro ao atualizar conta:", error);
    }
  };

  const deleteAccountData = async (accountId: string) => {
    if (!session?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      console.log("Deleting account:", accountId);
      await deleteAccount(session.user.id, accountId);
      console.log("Account deleted successfully");
      toast.success("Conta excluída com sucesso!");
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
    updateAccount: updateAccountData,
    deleteAccount: deleteAccountData
  };
};
