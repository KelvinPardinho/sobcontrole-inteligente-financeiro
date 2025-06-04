
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
import { calculateCreditCardUsage } from "@/utils/accountCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AccountFormFields } from "./AccountFormFields";
import { CreditCardFields } from "./CreditCardFields";

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
  accountId?: string;
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
    if (initialData?.type === "credit_card" && accountId && session?.user) {
      calculateCreditCardUsage(accountId, session.user.id, supabase)
        .then(setCreditCardUsage);
    }
  }, [initialData, accountId, session]);

  function handleSubmit(data: z.infer<typeof formSchema>) {
    onSubmit(data as Omit<Account, "id">);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Editar Conta/Cartão" : "Nova Conta/Cartão"}
        </h2>

        <AccountFormFields 
          control={form.control}
          accountType={accountType}
          setAccountType={setAccountType}
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
          <CreditCardFields 
            control={form.control}
            limit={limit}
            creditCardUsage={creditCardUsage}
            initialData={initialData}
          />
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
