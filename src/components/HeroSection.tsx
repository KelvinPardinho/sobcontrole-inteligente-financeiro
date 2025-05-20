
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 opacity-20 blur-3xl bg-gradient-to-br from-sob-blue to-sob-blue/30"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 opacity-20 blur-3xl bg-gradient-to-tr from-sob-green to-sob-green/30"></div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="text-center md:text-left space-y-6 max-w-xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-sob-blue/10 text-sob-blue font-medium text-sm">
              Simplicidade é o diferencial
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Tenha suas finanças{" "}
              <span className="text-sob-blue">sob controle</span>,{" "}
              <span className="relative">
                <span className="relative z-10">sem complicação</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-sob-green/20 -z-0"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Plataforma simples e intuitiva para gerenciar suas finanças
              pessoais sem precisar conectar contas bancárias.
            </p>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-sob-blue hover:bg-sob-blue/90">
                <Link to="/register">Comece Grátis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">Ver Planos</Link>
              </Button>
            </div>
          </div>

          <div className="max-w-md mx-auto md:max-w-none">
            <div className="p-1 bg-gradient-to-tr from-transparent via-sob-blue/20 to-sob-green/20 rounded-xl shadow-xl">
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80"
                  alt="Dashboard financeiro"
                  className="w-full h-auto rounded-t-lg object-cover aspect-video"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Saldo atual</h3>
                      <p className="text-2xl font-bold text-sob-blue">R$ 3.549,87</p>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +12% este mês
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
