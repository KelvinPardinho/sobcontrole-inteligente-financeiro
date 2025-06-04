
import { Account } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { calculateAccountBalance, calculateCreditCardUsage } from "@/utils/accountCalculations";

export const fetchAccountsFromDB = async (userId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const formatAccountData = async (accountData: any[], userId: string): Promise<Account[]> => {
  return Promise.all(
    accountData.map(async (account) => {
      let calculatedBalance = account.balance ? Number(account.balance) : 0;
      let totalLimit = account.credit_limit ? Number(account.credit_limit) : undefined;
      let availableLimit = undefined;

      if (account.type === 'credit_card') {
        const usedAmount = await calculateCreditCardUsage(account.id, userId, supabase);
        availableLimit = totalLimit ? totalLimit - usedAmount : 0;
        console.log(`Cartão ${account.name}: Limite total: ${totalLimit}, Usado: ${usedAmount}, Disponível: ${availableLimit}`);
      } else {
        calculatedBalance = await calculateAccountBalance(account.id, userId, account.balance ? Number(account.balance) : 0, supabase);
      }

      return {
        id: account.id,
        name: account.name,
        type: account.type as Account["type"],
        lastFourDigits: account.last_four_digits || undefined,
        color: account.color || undefined,
        balance: calculatedBalance,
        limit: account.type === 'credit_card' ? availableLimit : (account.credit_limit ? Number(account.credit_limit) : undefined),
        totalLimit: account.type === 'credit_card' ? totalLimit : undefined,
        dueDay: account.due_day || undefined,
        closingDay: account.closing_day || undefined
      };
    })
  );
};

export const createAccount = async (userId: string, accountData: Omit<Account, "id">) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([{
      user_id: userId,
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

  if (error) throw error;
  return data;
};

export const updateAccount = async (userId: string, accountId: string, accountData: Omit<Account, "id">) => {
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
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccount = async (userId: string, accountId: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) throw error;
};
