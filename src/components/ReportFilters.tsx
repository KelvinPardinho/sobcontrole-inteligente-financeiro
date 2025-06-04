
import { Dispatch, SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

interface ReportFiltersProps {
  onFilterChange: (filters: any) => void;
  dateRange: DateRange;
  setDateRange: Dispatch<SetStateAction<DateRange>>;
}

export function ReportFilters({ onFilterChange, dateRange, setDateRange }: ReportFiltersProps) {
  const { data: categories } = useCategories();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      onFilterChange({ dateRange: range });
    }
  };

  const handleQuickRangeChange = (value: string) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (value) {
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "thisMonth":
        startDate.setDate(1);
        break;
      case "lastMonth":
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({ 
          from: startDate, 
          to: lastDayOfLastMonth 
        });
        onFilterChange({ 
          dateRange: { 
            from: startDate, 
            to: lastDayOfLastMonth 
          } 
        });
        return;
      case "thisYear":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
    }
    
    setDateRange({ from: startDate, to: today });
    onFilterChange({ dateRange: { from: startDate, to: today } });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Período Rápido</label>
          <Select onValueChange={handleQuickRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
              <SelectItem value="thisYear">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Período Personalizado</label>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Select defaultValue="all" onValueChange={(value) => onFilterChange({ type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Categorias</label>
          <Select defaultValue="all" onValueChange={(value) => onFilterChange({ category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            className="w-full bg-sob-blue hover:bg-sob-blue/90"
            onClick={() => onFilterChange({ 
              dateRange, 
              apply: true 
            })}
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
