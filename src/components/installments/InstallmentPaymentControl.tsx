
import { useState } from "react";
import { Transaction, Account } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock } from "lucide-react";
import { format, addMonths, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAccounts } from "@/hooks/useAccounts";

type InstallmentPaymentControlProps = {
  transaction: Transaction;
  onMarkAsPaid: (transactionId: string, paid: boolean) => void;
};

export function InstallmentPaymentControl({ 
  transaction, 
  onMarkAsPaid 
}: InstallmentPaymentControlProps) {
  const { accounts } = useAccounts();
  const [isUpdating, setIsUpdating] = useState(false);

  const account = accounts.find(acc => acc.id === transaction.accountId);
  const isPaid = transaction.installment?.paid || false;
  
  // Calcular data de vencimento baseada no cartão de crédito
  const getDueDate = () => {
    if (!account || account.type !== 'credit_card' || !account.dueDay) {
      return null;
    }
    
    const transactionDate = new Date(transaction.date);
    const currentInstallment = transaction.installment?.current || 1;
    
    // Calcular a data de vencimento da parcela atual
    const dueDate = new Date(transactionDate);
    dueDate.setDate(account.dueDay);
    
    // Adicionar meses baseado na parcela atual
    const installmentDueDate = addMonths(dueDate, currentInstallment - 1);
    
    return installmentDueDate;
  };

  const dueDate = getDueDate();
  const today = startOfDay(new Date());
  const isOverdue = dueDate ? isBefore(dueDate, today) && !isPaid : false;
  const isDueToday = dueDate ? format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') : false;

  const handleTogglePaid = async () => {
    setIsUpdating(true);
    try {
      await onMarkAsPaid(transaction.id, !isPaid);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    if (isPaid) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paga</Badge>;
    }
    
    if (isOverdue) {
      return <Badge variant="destructive">Em atraso</Badge>;
    }
    
    if (isDueToday) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Vence hoje</Badge>;
    }
    
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`payment-${transaction.id}`}
          checked={isPaid}
          onCheckedChange={handleTogglePaid}
          disabled={isUpdating}
        />
        <label
          htmlFor={`payment-${transaction.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Marcar como paga
        </label>
      </div>
      
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        
        {dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Vence: {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
        )}
        
        {account?.type === 'credit_card' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span>{account.name}</span>
            {account.lastFourDigits && <span>**** {account.lastFourDigits}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
