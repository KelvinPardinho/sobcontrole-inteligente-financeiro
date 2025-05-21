
import { useState } from "react";
import { Account } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { CreditCard, Wallet } from "lucide-react";

type AccountListProps = {
  accounts: Account[];
};

export function AccountList({ accounts }: AccountListProps) {
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredAccounts = accounts.filter(account => {
    if (activeTab === "all") return true;
    return account.type === activeTab;
  });

  // Calculate totals
  const bankTotal = accounts
    .filter(account => account.type === "checking" || account.type === "savings")
    .reduce((total, account) => total + (account.balance || 0), 0);
    
  const creditLimit = accounts
    .filter(account => account.type === "credit_card")
    .reduce((total, account) => total + (account.limit || 0), 0);

  const getAccountTypeLabel = (type: Account["type"]) => {
    const types = {
      checking: "Conta Corrente",
      savings: "Conta Poupança",
      credit_card: "Cartão de Crédito",
      investment: "Investimento",
      other: "Outro"
    };
    return types[type];
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Saldo em Contas
            </CardTitle>
            <CardDescription>
              Total em contas bancárias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {bankTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Limite de Crédito
            </CardTitle>
            <CardDescription>
              Soma dos limites de cartões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {creditLimit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="checking">Contas</TabsTrigger>
          <TabsTrigger value="credit_card">Cartões</TabsTrigger>
          <TabsTrigger value="investment">Investimentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="overflow-hidden">
                <div
                  className="h-1"
                  style={{ backgroundColor: account.color || "#3b82f6" }}
                />
                <CardHeader className="pb-2">
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription>
                    {account.lastFourDigits ? `**** ${account.lastFourDigits}` : ''} - {getAccountTypeLabel(account.type)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {account.type === "credit_card" ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Limite:</span>
                        <span className="font-medium">R$ {account.limit?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vencimento:</span>
                        <span className="font-medium">Dia {account.dueDay || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fechamento:</span>
                        <span className="font-medium">Dia {account.closingDay || '-'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-bold">
                      R$ {account.balance?.toFixed(2) || '0.00'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
