
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const handleApplyFilters = () => {
    onFilterChange({
      type,
      category,
      startDate,
      endDate,
      search,
    });
  };

  const handleResetFilters = () => {
    setType("all");
    setCategory("all");
    setStartDate("");
    setEndDate("");
    setSearch("");
    
    onFilterChange({
      type: "all",
      category: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const categories = [
    { id: "1", name: "Alimentação" },
    { id: "2", name: "Transporte" },
    { id: "3", name: "Moradia" },
    { id: "4", name: "Educação" },
    { id: "5", name: "Lazer" },
    { id: "6", name: "Saúde" },
    { id: "7", name: "Salário" },
    { id: "8", name: "Investimentos" },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="transaction-category">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">De</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Até</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Busca</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar transações"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
          <Button size="sm" onClick={handleApplyFilters} className="bg-sob-blue hover:bg-sob-blue/90">
            <Search className="mr-2 h-4 w-4" />
            Aplicar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
