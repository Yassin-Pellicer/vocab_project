import * as React from "react"
import { BookOpen, Languages, Rocket } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useConfigStore } from "@/context/dictionary-context";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Languages,
  Rocket,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useConfigStore();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild={!!item.url}>
                  {item.url ? (
                    <Link to={item.url} className="font-medium">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="font-medium">{item.title}</span>
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const Icon = subItem.icon ? iconMap[subItem.icon] : null;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} className="flex items-center gap-2">
                              {Icon && <Icon size={12} />}
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
