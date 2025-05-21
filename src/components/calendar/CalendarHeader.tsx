
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "month" | "week" | "list";
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ 
  currentDate, 
  viewMode, 
  onPrevious, 
  onNext, 
  onToday 
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">
        {viewMode === "month" 
          ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
          : `${format(currentDate, 'dd MMM', { locale: ptBR })} - ${format(addDays(currentDate, 6), 'dd MMM', { locale: ptBR })}`
        }
      </h2>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onToday}>
          <CalendarIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
