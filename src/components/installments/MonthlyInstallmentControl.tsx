
import { useState } from "react";
import { Transaction, Account } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock } from "lucide-react";
import { format, addMonths, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAccounts } from "@/hooks/useAccounts";

type MonthlyInstallmentControlProps = {
  transaction: Transaction;
  onMarkAsPaid: (transactionId: string, paid: boolean) => void;
};

export function MonthlyInstallmentControl({ 
  transaction, 
  onMarkAsPaid 
}: MonthlyInstallmentControlProps) {
  const { accounts } = useAccounts();
  const [isUpdating, setIsUpdating] = useState(false);

  const account = accounts.find(acc => acc.id === transaction.accountId);
  const { current, total } = transaction.installment || { current: 1, total: 1 };
  
  // Gerar lista de parcelas mensais
  const generateMonthlyInstallments = () => {
    const installments = [];
    const purchaseDate = new Date(transaction.date);
    
    for (let i = 1; i <= total; i++) {
      const dueDate = account?.type === 'credit_card' && account.dueDay
        ? (() => {
            const installmentMonth = addMonths(purchaseDate, i - 1);
            const due = new Date(installmentMonth);
            due.setDate(account.dueDay);
            return due;
          })()
        : addMonths(purchaseDate, i - 1);
      
      const today = startOfDay(new Date());
      const isOverdue = isBefore(dueDate, today);
      const isDueToday = format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      const isPaid = i <= current && transaction.installment?.paid;
      const isCurrentDue = i === current;
      
      installments.push({
        number: i,
        dueDate,
        isOverdue: isOverdue && !isPaid && i <= current,
        isDueToday: isDueToday && !isPaid && i <= current,
        isPaid,
        isCurrentDue,
        shouldShow: i <= current // Mostrar apenas parcelas que já venceram
      });
    }
    
    return installments;
  };

  const monthlyInstallments = generateMonthlyInstallments();
  const currentInstallment = monthlyInstallments.find(inst => inst.isCurrentDue && inst.shouldShow);

  const handleTogglePaid = async () => {
    setIsUpdating(true);
    try {
      await onMarkAsPaid(transaction.id, !transaction.installment?.paid);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (installment: any) => {
    if (installment.isPaid) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paga</Badge>;
    }
    
    if (installment.isOverdue) {
      return <Badge variant="destructive">Em atraso</Badge>;
    }
    
    if (installment.isDueToday) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Vence hoje</Badge>;
    }
    
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <div className="space-y-3">
      {/* Mostrar apenas a parcela atual se houver uma vencida */}
      {currentInstallment && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`payment-${transaction.id}-${currentInstallment.number}`}
              checked={currentInstallment.isPaid}
              onCheckedChange={handleTogglePaid}
              disabled={isUpdating}
            />
            <label
              htmlFor={`payment-${transaction.id}-${currentInstallment.number}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Parcela {currentInstallment.number}/{total}
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(currentInstallment)}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Vence: {format(currentInstallment.dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            
            {account?.type === 'credit_card' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>{account.name}</span>
                {account.lastFourDigits && <span>**** {account.lastFourDigits}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumo das outras parcelas */}
      {monthlyInstallments.filter(inst => inst.shouldShow && !inst.isCurrentDue).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <div className="flex gap-2 flex-wrap">
            {monthlyInstallments
              .filter(inst => inst.shouldShow && !inst.isCurrentDue)
              .map(installment => (
                <span key={installment.number} className="flex items-center gap-1">
                  {installment.number}: {getStatusBadge(installment)}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
