
import { Badge } from "@/components/ui/badge";
import { isSameDay, isSameMonth, format } from "date-fns";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getDayTransactionsSummary, getTransactionsForDate } from "./CalendarUtils";

interface CalendarDayCellProps {
  day: Date;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  transactions: Transaction[];
  onDayDoubleClick?: (date: Date) => void;
}

export function CalendarDayCell({ 
  day, 
  currentDate, 
  onDateSelect, 
  selectedDate, 
  transactions,
  onDayDoubleClick
}: CalendarDayCellProps) {
  const dayTransactions = getTransactionsForDate(transactions, day);
  const { income, expense, total } = getDayTransactionsSummary(transactions, day);
  const isToday = isSameDay(day, new Date());
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  
  const handleClick = () => {
    onDateSelect(day);
  };
  
  const handleDoubleClick = () => {
    if (onDayDoubleClick) {
      onDayDoubleClick(day);
    }
  };
  
  return (
    <div
      className={`p-2 min-h-[100px] border rounded-md transition-all hover:shadow-md cursor-pointer ${
        isToday ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''
      } ${isSelected ? 'ring-2 ring-sob-blue' : ''} ${
        !isSameMonth(day, currentDate) ? 'text-gray-400 dark:text-gray-600' : ''
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Clique duplo para adicionar transação"
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${isToday ? 'bg-sob-blue text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
          {format(day, 'd')}
        </span>
        {dayTransactions.length > 0 && (
          <Badge className={`text-xs ${
            total >= 0 ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                   : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatCurrency(Math.abs(total))}
          </Badge>
        )}
      </div>
      
      {(income > 0 || expense > 0) && (
        <div className="flex flex-col gap-1 mb-2 text-xs">
          {income > 0 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <ArrowUpCircle className="h-3 w-3" />
              <span>{formatCurrency(income)}</span>
            </div>
          )}
          {expense > 0 && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <ArrowDownCircle className="h-3 w-3" />
              <span>{formatCurrency(expense)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-1">
        {dayTransactions.slice(0, 2).map((transaction) => (
          <div
            key={transaction.id}
            className={`text-xs p-1 rounded truncate ${
              transaction.type === "income"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {transaction.description}
          </div>
        ))}
        {dayTransactions.length > 2 && (
          <div className="text-xs text-center text-muted-foreground">
            +{dayTransactions.length - 2} mais
          </div>
        )}
      </div>
    </div>
  );
}
