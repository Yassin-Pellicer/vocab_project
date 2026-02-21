import * as React from "react"
import { BookOpen, EllipsisVertical, Languages, Rocket } from "lucide-react"

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
import DictActionsMenu from "./dict-actions-menu";
import AddDictModal from "../dict/add-dict-modal";

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
                      <div className="flex items-center justify-between w-full">
                        {item.title}
                        {item.key && item.route && <DictActionsMenu dictId={item.key} dictName={item.title} currentRoute={item.route} />}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      {item.title}
                      {item.key && item.route && <DictActionsMenu dictId={item.key} dictName={item.title} currentRoute={item.route} />}
                    </div>
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const Icon = subItem.icon ? iconMap[subItem.icon] : null;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <div className="flex items-center justify-between">
                              <Link to={subItem.url} className="flex items-center gap-2">
                                {Icon && <Icon size={12} />}
                                {subItem.title}
                              </Link>
                            </div>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
            <SidebarMenuSub>
              <AddDictModal></AddDictModal>
            </SidebarMenuSub>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
