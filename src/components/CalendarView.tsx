
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from "date-fns";
import { Transaction } from "@/types";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarMonthView } from "./calendar/CalendarMonthView";
import { CalendarWeekView } from "./calendar/CalendarWeekView";
import { CalendarListView } from "./calendar/CalendarListView";

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
              onDateSelect={onDateSelect}
              selectedDate={selectedDate}
              transactions={transactions}
              emptyDaysAtStart={emptyDaysAtStart}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekView
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateSelect={onDateSelect}
              selectedDate={selectedDate}
              transactions={transactions}
            />
          )}
        </>
      ) : (
        <CalendarListView transactions={transactions} />
      )}
    </div>
  );
}
