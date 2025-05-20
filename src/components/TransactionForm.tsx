
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onSubmit: (data: any) => void;
}

const categories = [
  { id: "1", name: "Alimentação", color: "#FF6B6B" },
  { id: "2", name: "Transporte", color: "#4ECDC4" },
  { id: "3", name: "Moradia", color: "#45B7D1" },
  { id: "4", name: "Educação", color: "#A367DC" },
  { id: "5", name: "Lazer", color: "#FFA500" },
  { id: "6", name: "Saúde", color: "#38E54D" },
  { id: "7", name: "Salário", color: "#00A76F" },
  { id: "8", name: "Investimentos", color: "#6366F1" },
];

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [installments, setInstallments] = useState("1");
  const [showInstallments, setShowInstallments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !date) {
      toast("Preencha todos os campos obrigatórios");
      return;
    }
    
    const data = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      installments: showInstallments ? parseInt(installments) : 1,
    };
    
    onSubmit(data);
    
    // Reset form
    setAmount("");
    setDescription("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setInstallments("1");
    setShowInstallments(false);
    
    toast("Transação adicionada com sucesso!");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
        <CardDescription>
          Registre uma nova receita ou despesa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={cn(
                "w-full",
                type === "income" && "bg-sob-green hover:bg-sob-green/90"
              )}
              onClick={() => setType("income")}
            >
              Receita
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={cn(
                "w-full",
                type === "expense" && "bg-destructive hover:bg-destructive/90"
              )}
              onClick={() => setType("expense")}
            >
              Despesa
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Conta de luz"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center">
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {type === "expense" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="installments-toggle"
                checked={showInstallments}
                onChange={() => setShowInstallments(!showInstallments)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="installments-toggle">Parcelado</Label>
            </div>
          )}

          {showInstallments && (
            <div className="space-y-2">
              <Label htmlFor="installments">Número de parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="2"
                max="48"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          {type === "income" ? "Adicionar Receita" : "Adicionar Despesa"}
        </Button>
      </CardFooter>
    </Card>
  );
}
