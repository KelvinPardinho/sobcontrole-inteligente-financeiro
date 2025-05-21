
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const routes = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Transações", path: "/transactions" },
  { name: "Calendário", path: "/calendar" },
  { name: "Relatórios", path: "/reports" },
  { name: "Planos", path: "/pricing" },
];

export function MainNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold">
            <span className="text-sob-blue">Sob</span>Controle
          </h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-4">
        <NavigationMenu>
          <NavigationMenuList>
            {routes.map((route) => (
              <NavigationMenuItem key={route.path}>
                <Link to={route.path}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(route.path) &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {route.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <ThemeToggle />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Conta</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[400px]">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/profile"
                      className="flex h-full w-full flex-col justify-between rounded-md bg-background p-6 no-underline outline-none focus:shadow-md"
                    >
                      <div className="mb-2 text-lg font-medium">Perfil</div>
                      <div className="text-sm text-muted-foreground">
                        Gerencie suas informações pessoais
                      </div>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex h-full w-full flex-col justify-between rounded-md bg-background p-6 no-underline outline-none focus:shadow-md"
                    >
                      <div className="mb-2 text-lg font-medium">Configurações</div>
                      <div className="text-sm text-muted-foreground">
                        Prefêrencias e configurações
                      </div>
                    </Link>
                  </div>
                  <div>
                    <Link to="/logout">
                      <Button variant="outline" className="w-full">
                        Sair
                      </Button>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-sob-blue",
                    isActive(route.path)
                      ? "text-sob-blue"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {route.name}
                </Link>
              ))}
              <div className="h-px bg-border my-4" />
              <Link
                to="/profile"
                className="text-lg font-medium transition-colors hover:text-sob-blue"
                onClick={() => setIsOpen(false)}
              >
                Perfil
              </Link>
              <Link
                to="/settings"
                className="text-lg font-medium transition-colors hover:text-sob-blue"
                onClick={() => setIsOpen(false)}
              >
                Configurações
              </Link>
              <Link
                to="/logout"
                className="text-lg font-medium transition-colors hover:text-sob-blue"
                onClick={() => setIsOpen(false)}
              >
                Sair
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
