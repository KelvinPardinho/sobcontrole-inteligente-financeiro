
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useCategories";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function GoalForm({ onSubmit, isLoading }: GoalFormProps) {
  const [goalType, setGoalType] = useState<"savings" | "expense">("savings");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [notifyAt, setNotifyAt] = useState("80");
  const [targetDate, setTargetDate] = useState<Date>();

  const { categories } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || null,
      type: goalType,
      category_id: category || null,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      period,
      notify_at: parseInt(notifyAt, 10),
      is_completed: false,
      target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Criar Nova Meta</DialogTitle>
        <DialogDescription>
          Defina uma meta de economia ou limite de gastos para acompanhar seu progresso financeiro.
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={goalType} onValueChange={(value) => setGoalType(value as "savings" | "expense")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="savings">Meta de Economia</TabsTrigger>
          <TabsTrigger value="expense">Limite de Gastos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="savings" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input
              id="name"
              placeholder="Ex: Reserva de emergência"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo desta meta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor objetivo (R$)</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder="0,00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetDate">Data objetivo (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação Mensal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Limite (R$)</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder="0,00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Período</Label>
            <Select value={period} onValueChange={setPeriod} required>
              <SelectTrigger id="period">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notifyAt">Alertar quando atingir (%)</Label>
            <Select value={notifyAt} onValueChange={setNotifyAt} required>
              <SelectTrigger id="notifyAt">
                <SelectValue placeholder="Selecione um percentual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="70">70%</SelectItem>
                <SelectItem value="80">80%</SelectItem>
                <SelectItem value="90">90%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button type="submit" className="bg-sob-blue hover:bg-sob-blue/90" disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar Meta"}
        </Button>
      </div>
    </form>
  );
}
