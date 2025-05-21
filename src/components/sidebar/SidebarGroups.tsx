
import { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

type SidebarGroupProps = {
  label: string;
  children: ReactNode;
};

export function SidebarGroupComponent({ label, children }: SidebarGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        {children}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
