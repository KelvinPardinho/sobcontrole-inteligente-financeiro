
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalFormProps {
  onSubmit: (data: any) => void;
}

export function GoalForm({ onSubmit }: GoalFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [notifyAt, setNotifyAt] = useState("80");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      limit: parseFloat(limit),
      period,
      notifyAt: parseInt(notifyAt, 10),
    });
  };

  const categories = [
    { id: "1", name: "Alimentação" },
    { id: "2", name: "Transporte" },
    { id: "3", name: "Moradia" },
    { id: "4", name: "Educação" },
    { id: "5", name: "Lazer" },
    { id: "6", name: "Saúde" },
    { id: "7", name: "Outros" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Adicionar Meta</DialogTitle>
        <DialogDescription>
          Defina limites de gastos para suas categorias e receba alertas quando se aproximar deles.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
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
          <Select value={category} onValueChange={setCategory} required>
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
          <Label htmlFor="limit">Limite (R$)</Label>
          <Input
            id="limit"
            type="number"
            placeholder="0,00"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
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
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" className="bg-sob-blue hover:bg-sob-blue/90">
          Criar Meta
        </Button>
      </div>
    </form>
  );
}
