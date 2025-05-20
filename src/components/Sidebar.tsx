
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Home,
  MessageSquare,
  PieChart,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";

export function AppSidebar() {
  const location = useLocation();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <ShadcnSidebar>
      <SidebarHeader className="border-b py-4">
        <Link to="/" className="flex items-center px-3">
          <h1 className="text-xl font-bold">
            <span className="text-sob-blue">Sob</span>Controle
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                >
                  <Link to="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Finance Tools Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Finanças</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/transactions")}
                  tooltip="Transações"
                >
                  <CreditCard />
                  <span>Transações</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/transactions?type=income">Receitas</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/transactions?type=expense">Despesas</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/transactions/new">Nova Transação</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/calendar")}
                  tooltip="Calendário"
                  asChild
                >
                  <Link to="/calendar">
                    <Calendar />
                    <span>Calendário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/reports")}
                  tooltip="Relatórios"
                >
                  <PieChart />
                  <span>Relatórios</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/reports?type=monthly">Mensal</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/reports?type=category">Categorias</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/reports?type=comparison">Comparação</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/goals")}
                  tooltip="Metas"
                  asChild
                >
                  <Link to="/goals">
                    <Settings />
                    <span>Metas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={isActive("/import")}
                  tooltip="Importar"
                  asChild
                >
                  <Link to="/import">
                    <Settings />
                    <span>Importar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Perfil">
                  <User />
                  <span>Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configurações">
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <Drawer open={assistantOpen} onOpenChange={setAssistantOpen}>
            <DrawerTrigger asChild>
              <Button className="w-full" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Assistente
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Assistente Financeiro</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 py-2 h-[50vh] overflow-auto">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm">Como posso ajudar você hoje com suas finanças?</p>
                </div>

                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1">
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                      <p className="text-sm">Como economizar dinheiro este mês?</p>
                    </div>
                  </div>
                  <User className="bg-primary text-primary-foreground p-1 rounded-full h-6 w-6" />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    Você pode economizar dinheiro este mês de várias formas:
                    <br /><br />
                    1. Analise seus gastos recentes para identificar despesas desnecessárias<br />
                    2. Estabeleça um limite de gastos para categorias não essenciais<br />
                    3. Compare seus gastos com o mês anterior<br />
                    4. Defina uma meta de economia na seção "Metas"
                  </p>
                </div>
              </div>
              <DrawerFooter className="border-t">
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    className="flex-1 border rounded-md px-3 py-2" 
                    placeholder="Digite sua pergunta..."
                  />
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="mt-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
