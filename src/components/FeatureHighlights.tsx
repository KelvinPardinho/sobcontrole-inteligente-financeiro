
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Calendar, Camera, FileText, Plus } from "lucide-react";

const features = [
  {
    title: "Lançamentos manuais",
    description:
      "Adicione transações facilmente com descrição detalhada e categorização",
    icon: <Plus className="h-10 w-10 text-sob-blue/80" />,
  },
  {
    title: "Importação de extratos",
    description: "Importe dados financeiros de arquivos CSV, PDF ou OFX",
    icon: <FileText className="h-10 w-10 text-sob-blue/80" />,
  },
  {
    title: "Leitura de comprovantes",
    description:
      "Capture notas fiscais ou recibos por imagem e extraia os dados automaticamente",
    icon: <Camera className="h-10 w-10 text-sob-blue/80" />,
  },
  {
    title: "Calendário financeiro",
    description: "Visualize suas despesas futuras e parcelas em um calendário",
    icon: <Calendar className="h-10 w-10 text-sob-blue/80" />,
  },
  {
    title: "Metas e orçamentos",
    description: "Defina limites por categoria e receba alertas",
    icon: <ArrowUp className="h-10 w-10 text-sob-blue/80" />,
  },
];

export function FeatureHighlights() {
  return (
    <div className="py-12 md:py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Ferramentas completas para te ajudar a ter mais controle sobre suas finanças pessoais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <Card
            key={i}
            className="overflow-hidden border-border hover:shadow-md transition-all"
          >
            <CardContent className="p-6 flex flex-col items-start">
              <div className="p-3 mb-4 rounded-lg bg-muted/50">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
