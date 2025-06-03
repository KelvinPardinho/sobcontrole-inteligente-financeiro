
import { useState } from "react";
import { Account } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AccountActions } from "./AccountActions";
import { AccountForm } from "./AccountForm";

interface AccountListProps {
  accounts: Account[];
  onEdit: (accountId: string, data: Omit<Account, "id">) => void;
  onDelete: (accountId: string) => void;
}

export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const getAccountTypeLabel = (type: Account["type"]) => {
    const labels = {
      checking: "Conta Corrente",
      savings: "Conta Poupança", 
      credit_card: "Cartão de Crédito",
      investment: "Investimento",
      other: "Outro"
    };
    return labels[type];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
  };

  const handleEditSubmit = (data: Omit<Account, "id">) => {
    if (editingAccount) {
      onEdit(editingAccount.id, data);
      setEditingAccount(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma conta ou cartão cadastrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {account.color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                  )}
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                </div>
                <AccountActions 
                  account={account}
                  onEdit={() => handleEdit(account)}
                  onDelete={() => onDelete(account.id)}
                />
              </div>
              <Badge variant="secondary" className="w-fit">
                {getAccountTypeLabel(account.type)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {account.lastFourDigits && (
                  <p className="text-sm text-muted-foreground">
                    Final: •••• {account.lastFourDigits}
                  </p>
                )}
                
                {account.type === "credit_card" ? (
                  <div className="space-y-2">
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Limite total:</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(account.limit || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Limite disponível:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(account.limit || 0)}
                        </span>
                      </div>
                    </div>
                    {account.dueDay && (
                      <p className="text-xs text-muted-foreground">
                        Vencimento: dia {account.dueDay}
                      </p>
                    )}
                    {account.closingDay && (
                      <p className="text-xs text-muted-foreground">
                        Fechamento: dia {account.closingDay}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Saldo:</span>
                    <span className={`font-semibold ${(account.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance || 0)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingAccount && (
        <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent className="sm:max-w-lg">
            <AccountForm 
              onSubmit={handleEditSubmit}
              initialData={{
                name: editingAccount.name,
                type: editingAccount.type,
                lastFourDigits: editingAccount.lastFourDigits,
                color: editingAccount.color,
                balance: editingAccount.balance,
                limit: editingAccount.limit,
                dueDay: editingAccount.dueDay,
                closingDay: editingAccount.closingDay
              }}
              accountId={editingAccount.id}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
