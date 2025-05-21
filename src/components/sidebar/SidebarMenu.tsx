
import { Link, useLocation } from "react-router-dom";
import {
  SidebarMenu as ShadcnSidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  subItems?: {
    title: string;
    path: string;
  }[];
};

type SidebarMenuProps = {
  items: MenuItem[];
};

export function SidebarMenu({ items }: SidebarMenuProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <ShadcnSidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.subItems ? (
            <>
              <SidebarMenuButton 
                isActive={isActive(item.path)}
                tooltip={item.title}
              >
                {item.icon}
                <span>{item.title}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link to={subItem.path}>{subItem.title}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </>
          ) : (
            <SidebarMenuButton 
              isActive={isActive(item.path)}
              tooltip={item.title}
              asChild
            >
              <Link to={item.path}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </ShadcnSidebarMenu>
  );
}
