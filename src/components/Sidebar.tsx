
import { Link } from "react-router-dom";
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarGroupComponent } from "./sidebar/SidebarGroups";
import { SidebarMenu } from "./sidebar/SidebarMenu";
import { SidebarFooterComponent } from "./sidebar/SidebarFooter";
import { dashboardItems, financeItems, accountItems } from "./sidebar/SidebarConfig";

export function AppSidebar() {
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
        <SidebarGroupComponent label="Principal">
          <SidebarMenu items={dashboardItems} />
        </SidebarGroupComponent>

        {/* Finance Tools Group */}
        <SidebarGroupComponent label="Finanças">
          <SidebarMenu items={financeItems} />
        </SidebarGroupComponent>

        {/* Account Group */}
        <SidebarGroupComponent label="Conta">
          <SidebarMenu items={accountItems} />
        </SidebarGroupComponent>
      </SidebarContent>

      <SidebarFooterComponent />
    </ShadcnSidebar>
  );
}
