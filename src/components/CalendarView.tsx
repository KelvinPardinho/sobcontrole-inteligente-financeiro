
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, addYears, subYears } from "date-fns";
import { Transaction } from "@/types";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarMonthView } from "./calendar/CalendarMonthView";
import { CalendarWeekView } from "./calendar/CalendarWeekView";
import { CalendarListView } from "./calendar/CalendarListView";
import { CalendarYearView } from "./calendar/CalendarYearView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";

interface CalendarViewProps {
  transactions: Transaction[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  viewMode: "month" | "week" | "list" | "year";
}

export function CalendarView({ transactions, selectedDate = new Date(), onDateSelect, viewMode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState<Date | null>(null);

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

  const handlePreviousClick = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else if (viewMode === "year") {
      setCurrentDate(subYears(currentDate, 1));
    }
  };

  const handleNextClick = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else if (viewMode === "year") {
      setCurrentDate(addYears(currentDate, 1));
    }
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };

  const handleDayDoubleClick = (date: Date) => {
    setTransactionDate(date);
    setIsTransactionDialogOpen(true);
  };

  const handleTransactionSubmit = (transactionData: any) => {
    // This function will be passed to the parent component 
    // to add the actual transaction
    const newTransaction = {
      ...transactionData,
      id: `temp-${Date.now()}`, // Temporary ID, should be replaced by parent
    };
    
    // Close dialog
    setIsTransactionDialogOpen(false);
    
    // Pass the new transaction up to parent
    if (window.addCalendarTransaction) {
      window.addCalendarTransaction(newTransaction);
    }
  };

  const emptyDaysAtStart = viewMode === "month" 
    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() 
    : 0;

  return (
    <div>
      {viewMode !== "list" ? (
        <>
          <CalendarHeader 
            currentDate={currentDate}
            viewMode={viewMode}
            onPrevious={handlePreviousClick}
            onNext={handleNextClick}
            onToday={() => setCurrentDate(new Date())}
          />

          {viewMode === "month" && (
            <CalendarMonthView
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              transactions={transactions}
              emptyDaysAtStart={emptyDaysAtStart}
              onDayDoubleClick={handleDayDoubleClick}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekView
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              transactions={transactions}
              onDayDoubleClick={handleDayDoubleClick}
            />
          )}

          {viewMode === "year" && (
            <CalendarYearView
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              transactions={transactions}
            />
          )}
        </>
      ) : (
        <CalendarListView transactions={transactions} />
      )}

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Nova Transação - {transactionDate ? format(transactionDate, 'dd/MM/yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm 
            onSubmit={handleTransactionSubmit} 
            initialDate={transactionDate?.toISOString().split('T')[0]} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add global type for the function that will be called from parent
declare global {
  interface Window {
    addCalendarTransaction?: (transaction: any) => void;
  }
}
