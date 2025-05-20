
import { HeroSection } from "@/components/HeroSection";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { AIFeatures } from "@/components/AIFeatures";
import { PricingPlans } from "@/components/PricingPlans";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">
              <span className="text-sob-blue">Sob</span>Controle
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Início
            </Link>
            <Link to="/features" className="text-muted-foreground hover:text-foreground">
              Recursos
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
              Planos
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              Sobre
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-sob-blue hover:bg-sob-blue/90">
              <Link to="/register">Registrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeatureHighlights />
        <AIFeatures />
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <PricingPlans />
          </div>
        </section>

        <section className="py-16 md:py-24 bg-sob-light-gray">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para organizar sua vida financeira?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Comece a utilizar o SobControle gratuitamente hoje mesmo e tenha o controle total sobre suas finanças.
            </p>
            <Button asChild size="lg" className="bg-sob-blue hover:bg-sob-blue/90">
              <Link to="/register">Começar Grátis</Link>
            </Button>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
