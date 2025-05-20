
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

const plans = [
  {
    id: "free",
    name: "Grátis",
    price: "0",
    description: "Para começar seu controle financeiro",
    features: [
      "Lançamentos ilimitados",
      "2 importações de extrato por mês",
      "5 leituras de imagem (OCR) por mês",
    ],
    limitations: ["Sem acesso ao agente de IA"],
    color: "bg-sob-green",
    buttonVariant: "outline" as const,
  },
  {
    id: "gold",
    name: "Gold",
    price: "29",
    description: "Para quem precisa de mais recursos",
    features: [
      "Lançamentos ilimitados",
      "Importações de extratos ilimitadas",
      "Leituras de imagem (OCR) ilimitadas",
    ],
    limitations: ["Sem acesso ao agente de IA"],
    color: "bg-sob-gold",
    buttonVariant: "outline" as const,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "49",
    description: "Experiência completa com IA",
    features: [
      "Lançamentos ilimitados",
      "Importações de extratos ilimitadas",
      "Leituras de imagem (OCR) ilimitadas",
      "Acesso completo ao agente financeiro com IA",
      "Sugestões de economia personalizadas",
      "Alertas preditivos",
    ],
    limitations: [],
    color: "bg-sob-blue",
    buttonVariant: "default" as const,
    recommended: true,
  },
];

export function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    toast(`Plano ${planId} selecionado!`, {
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Escolha seu plano</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Escolha o plano que melhor se adapta às suas necessidades financeiras e comece a organizar sua vida financeira hoje mesmo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col",
              plan.recommended && "border-sob-blue shadow-lg"
            )}
          >
            {plan.recommended && (
              <div className="px-3 py-1 text-sm text-white text-center font-medium rounded-t-lg bg-sob-blue">
                Recomendado
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">R${plan.price}</span>
                {plan.price !== "0" && <span className="text-muted-foreground">/mês</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-sob-green" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-center text-muted-foreground">
                    <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground">
                      -
                    </span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                variant={plan.buttonVariant}
                className={cn(
                  "w-full",
                  plan.buttonVariant === "default" && plan.color
                )}
              >
                {plan.id === "free" ? "Começar Grátis" : "Assinar Plano"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
