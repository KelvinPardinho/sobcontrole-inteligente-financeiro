
import { useState } from "react";
import { MessageSquare, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Como posso ajudar você hoje com suas finanças?", sender: "assistant" },
    { text: "Como economizar dinheiro este mês?", sender: "user" },
    { 
      text: "Você pode economizar dinheiro este mês de várias formas:\n\n1. Analise seus gastos recentes para identificar despesas desnecessárias\n2. Estabeleça um limite de gastos para categorias não essenciais\n3. Compare seus gastos com o mês anterior\n4. Defina uma meta de economia na seção \"Metas\"", 
      sender: "assistant" 
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-sob-blue hover:bg-sob-blue/90 shadow-md"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h3 className="font-medium">Higor Machado</h3>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto max-h-72 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : ''}`}
          >
            {message.sender === 'assistant' ? (
              <div className="bg-muted p-2 rounded-lg max-w-[85%] text-sm">
                <p>{message.text}</p>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg max-w-[85%] text-sm">
                  <p>{message.text}</p>
                </div>
                <User className="bg-primary text-primary-foreground p-1 rounded-full h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sob-blue"
            placeholder="Digite sua mensagem..."
          />
          <Button size="sm" className="px-2 py-1">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
