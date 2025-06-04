
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreditCardInfo } from "./CreditCardInfo";
import { Account } from "@/types";

interface CreditCardFieldsProps {
  control: Control<any>;
  limit: number;
  creditCardUsage: number;
  initialData?: Omit<Account, "id">;
}

export function CreditCardFields({ control, limit, creditCardUsage, initialData }: CreditCardFieldsProps) {
  return (
    <>
      <FormField
        control={control}
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

      {(limit || initialData?.limit) && (
        <CreditCardInfo 
          account={{ limit, totalLimit: limit, ...initialData } as Account}
          creditCardUsage={creditCardUsage}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
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
  );
}
