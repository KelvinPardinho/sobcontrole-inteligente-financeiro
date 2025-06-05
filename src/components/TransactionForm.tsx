
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface TransactionFormValues {
  type: "income" | "expense";
  amount: string;
  description: string;
  category: string;
  accountId: string;
  date: string;
  installments: string;
  isInstallment: boolean;
}

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  initialDate?: string;
  initialData?: {
    type: "income" | "expense";
    amount: string;
    description: string;
    date: string;
  };
}

export function TransactionForm({ onSubmit, initialDate, initialData }: TransactionFormProps) {
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string; type: string; lastFourDigits?: string }[]>([]);
  const { session } = useAuth();
  
  const form = useForm<TransactionFormValues>({
    defaultValues: {
      type: initialData?.type || "expense",
      amount: initialData?.amount || "",
      description: initialData?.description || "",
      category: "",
      accountId: "",
      date: initialData?.date || initialDate || new Date().toISOString().split("T")[0],
      installments: "1",
      isInstallment: false
    }
  });
  
  const { watch, setValue, register, handleSubmit, formState: { errors } } = form;
  
  const type = watch("type");
  const isInstallment = watch("isInstallment");
  const amount = watch("amount");
  const installments = watch("installments");

  useEffect(() => {
    fetchUserCategories();
    fetchUserAccounts();
  }, [session]);

  const fetchUserCategories = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchUserAccounts = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, last_four_digits')
        .eq('user_id', session.user.id)
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setAccounts(data.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          lastFourDigits: account.last_four_digits || undefined
        })));
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      checking: "Conta Corrente",
      savings: "Conta Poupança",
      credit_card: "Cartão de Crédito",
      investment: "Investimento",
      other: "Outro"
    };
    return types[type] || type;
  };

  // Calcular valor da parcela para exibição
  const getInstallmentValue = () => {
    if (!isInstallment || !amount || !installments) return null;
    const totalAmount = parseFloat(amount);
    const installmentCount = parseInt(installments);
    if (isNaN(totalAmount) || isNaN(installmentCount) || installmentCount === 0) return null;
    return (totalAmount / installmentCount).toFixed(2);
  };

  const submitForm = (values: TransactionFormValues) => {
    const formattedData = {
      ...values,
      amount: parseFloat(values.amount), // Manter o valor total
      installments: parseInt(values.installments) || 1
    };
    
    onSubmit(formattedData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
        <CardDescription>
          Registre uma nova receita ou despesa
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(submitForm)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={cn(
                  "w-full",
                  type === "income" && "bg-sob-green hover:bg-sob-green/90"
                )}
                onClick={() => setValue("type", "income")}
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
                onClick={() => setValue("type", "expense")}
              >
                Despesa
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                {isInstallment ? "Valor Total da Compra (R$)" : "Valor (R$)"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount", { required: true })}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs">Valor é obrigatório</p>
              )}
              {isInstallment && getInstallmentValue() && (
                <p className="text-sm text-muted-foreground">
                  Valor por parcela: R$ {getInstallmentValue()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Conta de luz"
                {...register("description", { required: true })}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">Descrição é obrigatória</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Conta/Cartão</Label>
              <Select 
                onValueChange={(value) => setValue("accountId", value)}
                value={form.watch("accountId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta ou cartão" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center">
                        {account.name}
                        {account.lastFourDigits && ` **** ${account.lastFourDigits}`}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({getAccountTypeLabel(account.type)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-red-500 text-xs">Conta/Cartão é obrigatório</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  onValueChange={(value) => setValue("category", value)}
                  value={form.watch("category")}
                >
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
                {errors.category && (
                  <p className="text-red-500 text-xs">Categoria é obrigatória</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: true })}
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-xs">Data é obrigatória</p>
                )}
              </div>
            </div>

            {type === "expense" && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="isInstallment" 
                  checked={isInstallment}
                  onCheckedChange={(checked) => setValue("isInstallment", !!checked)} 
                />
                <Label htmlFor="isInstallment" className="text-sm">Parcelado</Label>
              </div>
            )}

            {isInstallment && (
              <div className="space-y-2">
                <Label htmlFor="installments">Número de parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="2"
                  max="48"
                  {...register("installments", { 
                    min: 2, 
                    max: 48,
                    valueAsNumber: true
                  })}
                />
                {errors.installments && (
                  <p className="text-red-500 text-xs">Entre 2 e 48 parcelas</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {type === "income" ? "Adicionar Receita" : "Adicionar Despesa"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
