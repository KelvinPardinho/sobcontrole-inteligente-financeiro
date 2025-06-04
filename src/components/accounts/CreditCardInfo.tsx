
import { Account } from "@/types";

interface CreditCardInfoProps {
  account: Account;
  creditCardUsage: number;
}

export function CreditCardInfo({ account, creditCardUsage }: CreditCardInfoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalLimit = account.totalLimit || 0;
  const availableLimit = account.limit || 0;

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
      <h3 className="font-medium text-sm">Informações do Cartão</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Limite Total:</span>
          <p className="font-medium">
            {formatCurrency(totalLimit)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Limite Disponível:</span>
          <p className="font-medium text-green-600">
            {formatCurrency(availableLimit)}
          </p>
        </div>
      </div>
      {creditCardUsage > 0 && (
        <div className="text-xs text-muted-foreground">
          Valor usado: {formatCurrency(creditCardUsage)}
        </div>
      )}
    </div>
  );
}
