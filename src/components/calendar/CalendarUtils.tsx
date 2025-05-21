
import { isSameDay } from "date-fns";
import { Transaction } from "@/types";

/**
 * Gets transactions for a specific date
 */
export const getTransactionsForDate = (transactions: Transaction[], date: Date) => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return isSameDay(transactionDate, date);
  });
};

/**
 * Calculates transaction summary for a specific day
 */
export const getDayTransactionsSummary = (transactions: Transaction[], date: Date) => {
  const dayTransactions = getTransactionsForDate(transactions, date);
  const income = dayTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = dayTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expense, total: income - expense };
};

/**
 * Gets upcoming transactions sorted by date
 */
export const getUpcomingTransactions = (transactions: Transaction[], limit: number = 10) => {
  const today = new Date();
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate > today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
};
