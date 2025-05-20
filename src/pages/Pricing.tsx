
import { MainNav } from "@/components/MainNav";
import { PricingPlans } from "@/components/PricingPlans";
import { FooterSection } from "@/components/FooterSection";

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano que melhor atende às suas necessidades financeiras. 
              Todos os planos incluem as funcionalidades essenciais para você 
              ter controle sobre suas finanças.
            </p>
          </div>
          
          <PricingPlans />
          
          <div className="mt-16 bg-muted rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Tem dúvidas sobre qual plano escolher?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o plano ideal para suas
              necessidades financeiras. Entre em contato conosco para saber mais.
            </p>
            <a href="mailto:contato@sobcontrole.com" className="text-sob-blue hover:underline font-medium">
              contato@sobcontrole.com
            </a>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
