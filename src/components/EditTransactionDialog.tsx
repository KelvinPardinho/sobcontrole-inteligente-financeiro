
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/types";

interface EditTransactionDialogProps {
  transaction: Transaction;
  onTransactionUpdated: (transactionId: string, data: any) => Promise<boolean>;
}

interface FormData {
  type: "income" | "expense";
  amount: string;
  description: string;
  category: string;
  accountId: string;
  date: string;
}

export function EditTransactionDialog({ transaction, onTransactionUpdated }: EditTransactionDialogProps) {
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string; type: string; lastFourDigits?: string }[]>([]);
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category || "",
      accountId: transaction.accountId,
      date: transaction.date,
    }
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchAccounts();
      reset({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category || "",
        accountId: transaction.accountId,
        date: transaction.date,
      });
    }
  }, [open, transaction, reset]);

  const fetchCategories = async () => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchAccounts = async () => {
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

  const onSubmit = async (data: FormData) => {
    const success = await onTransactionUpdated(transaction.id, {
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description,
      category: data.category,
      accountId: data.accountId,
      date: data.date,
    });

    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={watch("type") === "income" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "income")}
            >
              Receita
            </Button>
            <Button
              type="button"
              variant={watch("type") === "expense" ? "default" : "outline"}
              className="w-full"
              onClick={() => setValue("type", "expense")}
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
              {...register("amount", { required: true })}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs">Valor é obrigatório</p>
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
              value={watch("accountId")}
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
                value={watch("category")}
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
              <Input
                id="date"
                type="date"
                {...register("date", { required: true })}
              />
              {errors.date && (
                <p className="text-red-500 text-xs">Data é obrigatória</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
