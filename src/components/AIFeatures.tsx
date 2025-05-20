
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AIFeatures() {
  return (
    <div className="py-12 md:py-20 bg-sob-light-gray">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <div className="inline-block px-4 py-2 mb-4 rounded-full bg-sob-blue/10 text-sob-blue font-medium text-sm">
              Plano Platinum
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Assistente Financeiro com IA
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Tenha um assistente pessoal que te ajuda a entender suas finanças e
              tomar decisões melhores através de inteligência artificial.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-sob-blue"></div>
                <p>
                  <span className="font-medium">Perguntas em linguagem natural</span> – Pergunte
                  sobre seus gastos como conversaria com um amigo
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-sob-blue"></div>
                <p>
                  <span className="font-medium">Sugestões personalizadas</span> – Receba dicas para
                  economizar baseadas no seu padrão de gastos
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-sob-blue"></div>
                <p>
                  <span className="font-medium">Alertas preditivos</span> – Seja avisado quando estiver
                  gastando acima da média ou quando uma conta grande estiver chegando
                </p>
              </div>
            </div>
            <Button className="mt-8 bg-sob-blue hover:bg-sob-blue/90">
              Conheça o plano Platinum
            </Button>
          </div>
          <div className="space-y-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-sob-blue/20 flex items-center justify-center text-sob-blue font-semibold">
                    ?
                  </div>
                  <div>
                    <p className="font-medium">Quanto gastei com transporte este mês?</p>
                    <p className="text-xs text-muted-foreground mt-1">Você</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-sob-blue/5 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-sob-blue flex items-center justify-center text-white font-semibold">
                    IA
                  </div>
                  <div>
                    <p>
                      Este mês você gastou <span className="font-medium">R$ 342,50</span> em transporte, 
                      o que representa 15% dos seus gastos totais.
                    </p>
                    <p className="mt-2">
                      Isso é 8% a menos que no mês passado, quando você gastou R$ 371,80.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Assistente SobControle</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-sob-blue/20 flex items-center justify-center text-sob-blue font-semibold">
                    ?
                  </div>
                  <div>
                    <p className="font-medium">
                      Como posso gastar menos com alimentação?
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Você</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-sob-blue/5 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-sob-blue flex items-center justify-center text-white font-semibold">
                    IA
                  </div>
                  <div>
                    <p>
                      Analisando seus gastos, percebi que você gasta em média R$ 120 por semana em 
                      delivery. Reduzindo para 2x por semana, você economizaria cerca de R$ 240 por mês.
                    </p>
                    <p className="mt-2">
                      Também notei que suas compras de supermercado são feitas sem planejamento. 
                      Fazer uma lista semanal pode reduzir seus gastos em até 20%.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Assistente SobControle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
