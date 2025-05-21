
import { CalendarDayCell } from "./CalendarDayCell";
import { Transaction } from "@/types";

interface CalendarWeekViewProps {
  calendarDays: Date[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  transactions: Transaction[];
}

export function CalendarWeekView({
  calendarDays,
  currentDate,
  onDateSelect,
  selectedDate,
  transactions
}: CalendarWeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
        <div key={day} className="text-center font-medium py-2 border-b">
          {day}
        </div>
      ))}
      
      {calendarDays.map((day) => (
        <CalendarDayCell
          key={day.toString()}
          day={day}
          currentDate={currentDate}
          onDateSelect={onDateSelect}
          selectedDate={selectedDate}
          transactions={transactions}
        />
      ))}
    </div>
  );
}
