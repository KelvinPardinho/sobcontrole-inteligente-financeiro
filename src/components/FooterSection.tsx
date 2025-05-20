
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";

export function FooterSection() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              <span className="text-sob-blue">Sob</span>Controle
            </h2>
            <p className="text-muted-foreground">
              Plataforma de controle financeiro pessoal simples e eficiente.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Central de ajuda
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contato
                </Link>
              </li>
              <li>
                <a
                  href="mailto:suporte@sobcontrole.com"
                  className="text-muted-foreground hover:text-foreground"
                >
                  suporte@sobcontrole.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SobControle. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
