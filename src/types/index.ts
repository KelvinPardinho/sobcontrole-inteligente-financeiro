export type Plan = 'free' | 'gold' | 'platinum';

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  lastFourDigits?: string;
  color?: string;
  balance?: number;
  limit?: number;
  totalLimit?: number; // Novo campo para armazenar o limite total do cartão
  dueDay?: number;
  closingDay?: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  accountId: string; // Agora obrigatório
  installment?: {
    current: number;
    total: number;
    paid?: boolean; // Status de pagamento da parcela
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  budget?: number;
}

export interface DashboardStats {
  balance: number;
  incomeTotal: number;
  expenseTotal: number;
  categorySummary: {
    [key: string]: number;
  };
  upcomingExpenses: number;
}
