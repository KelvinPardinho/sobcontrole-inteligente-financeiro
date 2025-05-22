
import { CalendarDayCell } from "./CalendarDayCell";
import { Transaction } from "@/types";

interface CalendarMonthViewProps {
  calendarDays: Date[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  transactions: Transaction[];
  emptyDaysAtStart: number;
  onDayDoubleClick?: (date: Date) => void;
}

export function CalendarMonthView({
  calendarDays,
  currentDate,
  onDateSelect,
  selectedDate,
  transactions,
  emptyDaysAtStart,
  onDayDoubleClick
}: CalendarMonthViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
        <div key={day} className="text-center font-medium py-2 border-b">
          {day}
        </div>
      ))}
      
      {Array.from({ length: emptyDaysAtStart }).map((_, i) => (
        <div key={`empty-${i}`} className="p-2 min-h-[100px]"></div>
      ))}
      
      {calendarDays.map((day) => (
        <CalendarDayCell
          key={day.toString()}
          day={day}
          currentDate={currentDate}
          onDateSelect={onDateSelect}
          selectedDate={selectedDate}
          transactions={transactions}
          onDayDoubleClick={onDayDoubleClick}
        />
      ))}
    </div>
  );
}
