
export const calculateAccountBalance = async (
  accountId: string, 
  userId: string, 
  initialBalance: number = 0,
  supabase: any
) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', userId);

    if (error) throw error;

    let balance = initialBalance;
    
    if (transactions) {
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          balance += Number(transaction.amount);
        } else {
          if (!transaction.installment_total || transaction.installment_total <= 1) {
            balance -= Number(transaction.amount);
          } else {
            const purchaseDate = new Date(transaction.date);
            const today = new Date();
            const monthsElapsed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const paidInstallments = Math.min(Math.max(monthsElapsed + 1, 1), transaction.installment_total);
            
            if (transaction.installment_paid) {
              balance -= Number(transaction.amount) * transaction.installment_total;
            } else {
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

export const calculateCreditCardUsage = async (
  accountId: string,
  userId: string,
  supabase: any
) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .eq('type', 'expense');

    if (error) throw error;

    let totalUsed = 0;
    
    if (transactions) {
      transactions.forEach(transaction => {
        if (!transaction.installment_total || transaction.installment_total <= 1) {
          totalUsed += Number(transaction.amount);
        } else {
          const purchaseDate = new Date(transaction.date);
          const today = new Date();
          const monthsElapsed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const currentInstallment = Math.min(Math.max(monthsElapsed + 1, 1), transaction.installment_total);
          
          if (currentInstallment <= transaction.installment_total && !transaction.installment_paid) {
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
