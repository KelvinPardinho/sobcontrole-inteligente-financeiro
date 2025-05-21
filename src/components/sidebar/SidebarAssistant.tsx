
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export function SidebarAssistant() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
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
  );
}
