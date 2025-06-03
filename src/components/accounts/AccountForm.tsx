
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Account, AccountType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome precisa ter pelo menos 2 caracteres.",
  }),
  type: z.enum(["checking", "savings", "credit_card", "investment", "other"]),
  lastFourDigits: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 4 && /^\d+$/.test(val);
  }, {
    message: "Digite exatamente 4 dígitos numéricos",
  }),
  color: z.string().optional(),
  balance: z.number().optional(),
  limit: z.number().optional(),
  dueDay: z.number().min(1).max(31).optional(),
  closingDay: z.number().min(1).max(31).optional(),
});

type AccountFormProps = {
  onSubmit: (data: Omit<Account, "id">) => void;
  initialData?: Omit<Account, "id">;
  accountId?: string; // Add this to pass the account ID when editing
};

export function AccountForm({ onSubmit, initialData, accountId }: AccountFormProps) {
  const [accountType, setAccountType] = useState<AccountType>(initialData?.type || "checking");
  const [creditCardUsage, setCreditCardUsage] = useState<number>(0);
  const { session } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: "checking",
      color: "#3b82f6",
    },
  });

  const limit = form.watch("limit");

  useEffect(() => {
    if (initialData?.type === "credit_card" && accountId) {
      calculateCreditCardUsage(accountId);
    }
  }, [initialData, accountId]);

  const calculateCreditCardUsage = async (accountIdParam: string) => {
    if (!session?.user) return;

    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountIdParam)
        .eq('user_id', session.user.id)
        .eq('type', 'expense');

      if (error) throw error;

      let totalUsed = 0;
      
      if (transactions) {
        transactions.forEach(transaction => {
          if (!transaction.installment_total || transaction.installment_total <= 1) {
            // Compra à vista
            totalUsed += Number(transaction.amount);
          } else {
            // Compra parcelada - somar valor total se ainda há parcelas em aberto
            const purchaseDate = new Date(transaction.date);
            const today = new Date();
            const monthsElapsed = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const currentInstallment = Math.min(Math.max(monthsElapsed + 1, 1), transaction.installment_total);
            
            if (currentInstallment < transaction.installment_total || !transaction.installment_paid) {
              // Ainda há parcelas em aberto, incluir no limite usado
              totalUsed += Number(transaction.amount) * transaction.installment_total;
            }
          }
        });
      }

      setCreditCardUsage(totalUsed);
    } catch (error) {
      console.error("Erro ao calcular uso do cartão:", error);
    }
  };

  function handleSubmit(data: z.infer<typeof formSchema>) {
    onSubmit(data as Omit<Account, "id">);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Editar Conta/Cartão" : "Nova Conta/Cartão"}
        </h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Itaú, Nubank, Bradesco" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={(value: AccountType) => {
                  field.onChange(value);
                  setAccountType(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Conta Poupança</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastFourDigits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Últimos 4 dígitos (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 1234" maxLength={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input type="color" className="w-12 h-10 p-1" {...field} />
                  <span className="text-sm">Cor de identificação</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {accountType !== "credit_card" && (
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Inicial</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {accountType === "credit_card" && (
          <>
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite Total</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mostrar informações do cartão de crédito */}
            {(limit || initialData?.limit) && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-sm">Informações do Cartão</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Limite Total:</span>
                    <p className="font-medium">R$ {(limit || initialData?.limit || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Limite Disponível:</span>
                    <p className="font-medium text-green-600">
                      R$ {((limit || initialData?.limit || 0) - creditCardUsage).toFixed(2)}
                    </p>
                  </div>
                </div>
                {creditCardUsage > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Valor usado: R$ {creditCardUsage.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        max={31}
                        placeholder="Ex: 15" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de fechamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        max={31}
                        placeholder="Ex: 8" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit">
            {initialData ? "Atualizar" : "Adicionar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
