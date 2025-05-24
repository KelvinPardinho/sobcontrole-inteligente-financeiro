
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

type InstallmentsFiltersProps = {
  onFilterChange: (filters: any) => void;
};

export function InstallmentsFilters({ onFilterChange }: InstallmentsFiltersProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const handleSearch = () => {
    onFilterChange({
      startDate: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
      endDate: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
      search,
      category,
      status,
    });
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearch("");
    setCategory("all");
    setStatus("all");
    
    onFilterChange({
      startDate: "",
      endDate: "",
      search: "",
      category: "all",
      status: "all",
    });
  };

  return (
    <div className="bg-card rounded-md border p-4 mb-6 space-y-4">
      <h3 className="font-medium">Filtros</h3>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select value={category} onValueChange={setCategory} disabled={categoriesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={categoriesLoading ? "Carregando..." : "Todas as categorias"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? (
                  format(dateFrom, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? (
                  format(dateTo, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por descrição..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Filtrar</Button>
        <Button variant="outline" onClick={handleReset}>Limpar</Button>
      </div>
    </div>
  );
}
