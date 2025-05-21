
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarAssistant } from "./SidebarAssistant";
import { SidebarFooter as ShadcnSidebarFooter } from "@/components/ui/sidebar";

export function SidebarFooterComponent() {
  return (
    <ShadcnSidebarFooter>
      <div className="p-2">
        <SidebarAssistant />

        <div className="mt-2 flex flex-col gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            Ajuda
          </Button>
        </div>
      </div>
    </ShadcnSidebarFooter>
  );
}
