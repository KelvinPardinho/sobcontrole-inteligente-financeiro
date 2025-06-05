
import React from "react";
import { Account } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  isLoading?: boolean;
}

export function AccountSelector({ 
  accounts, 
  selectedAccountId, 
  onAccountChange, 
  isLoading = false 
}: AccountSelectorProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Conta para importação *
        </label>
        <Select value={selectedAccountId || ""} onValueChange={onAccountChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.color }}
                  ></div>
                  <span>{account.name}</span>
                  <span className="text-muted-foreground">
                    ****{account.lastFourDigits}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você precisa ter pelo menos uma conta cadastrada para importar transações.
          </p>
        )}
      </div>
    </Card>
  );
}
