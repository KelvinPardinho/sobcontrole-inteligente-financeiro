
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CalendarViewProps {
  transactions: Transaction[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  viewMode: "month" | "week" | "list";
}

export function CalendarView({ transactions, selectedDate = new Date(), onDateSelect, viewMode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    if (viewMode === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      setCalendarDays(eachDayOfInterval({ start, end }));
    } else if (viewMode === "week") {
      const start = currentDate;
      const end = addDays(currentDate, 6);
      setCalendarDays(eachDayOfInterval({ start, end }));
    }
  }, [currentDate, viewMode]);

  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isSameDay(transactionDate, date);
    });
  };

  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    return dayTransactions.reduce((total, transaction) => {
      if (transaction.type === "income") {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  const getUpcomingTransactions = () => {
    const today = new Date();
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate > today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // Limitar a 10 transações
  };

  const handlePreviousClick = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNextClick = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  return (
    <div>
      {viewMode !== "list" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {viewMode === "month" 
                ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                : `${format(currentDate, 'dd MMM', { locale: ptBR })} - ${format(addDays(currentDate, 6), 'dd MMM', { locale: ptBR })}`
              }
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousClick}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextClick}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center font-medium py-2 border-b">
                {day}
              </div>
            ))}
            
            {viewMode === "month" && Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 min-h-[100px]"></div>
            ))}
            
            {calendarDays.map((day) => {
              const dayTransactions = getTransactionsForDate(day);
              const dayTotal = getDayTotal(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toString()}
                  className={`p-2 min-h-[100px] border rounded-md ${
                    isToday ? 'bg-blue-50 border-blue-200' : ''
                  } ${isSelected ? 'ring-2 ring-sob-blue' : ''} ${
                    !isSameMonth(day, currentDate) ? 'text-gray-400' : ''
                  }`}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isToday ? 'bg-sob-blue text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayTransactions.length > 0 && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        dayTotal >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {formatCurrency(Math.abs(dayTotal))}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTransactions.slice(0, 3).map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`text-xs p-1 rounded truncate ${
                          transaction.type === "income"
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {transaction.description}
                      </div>
                    ))}
                    {dayTransactions.length > 3 && (
                      <div className="text-xs text-center text-muted-foreground">
                        +{dayTransactions.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Próximas Transações</h2>
          
          {getUpcomingTransactions().map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                      {transaction.installment && (
                        <span className="ml-2">
                          (Parcela {transaction.installment.current}/{transaction.installment.total})
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`font-medium ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {getUpcomingTransactions().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Não há transações futuras cadastradas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
