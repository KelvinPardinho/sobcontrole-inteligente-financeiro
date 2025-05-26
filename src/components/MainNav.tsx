
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold">
            <span className="text-sob-blue">Sob</span><span className="text-foreground">Controle</span>
          </h1>
        </Link>
      </div>

      {/* Desktop Navigation - Centered */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
        <NavigationMenu>
          <NavigationMenuList>
            {routes.map((route) => (
              <NavigationMenuItem key={route.path}>
                <Link to={route.path}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-foreground hover:text-foreground",
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
      </div>

      {/* Right section - theme toggle only */}
      <div className="hidden md:flex">
        <ThemeToggle />
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
          <SheetContent side="right" className="bg-background border-border">
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
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
