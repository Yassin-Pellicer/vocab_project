import { } from "react"

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

import { DictionaryContext } from "@/context/dictionary-context";
import { Link } from "react-router-dom";
import DictActionsMenu from "./dict-actions-menu";
import AddDictModal from "../dict/add-dict-modal";
import { NavUser } from "./nav-user";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { sidebarNavigationData } = DictionaryContext();

  return (
    <Sidebar {...props}>
      <NavUser />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <div className="flex gap-1 flex-col">
              {sidebarNavigationData.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.url ? (
                      <Link to={item.url} className="flex items-center justify-between w-full font-medium hover:text-background!">
                        {item.title}
                        {item.key && item.route &&
                          <DictActionsMenu
                            dictId={item.key}
                            dictName={item.title}
                            route={item.route}
                          />
                        }
                      </Link>
                    ) : (
                      <div className="flex items-center mb-1 justify-between w-full font-medium hover:text-background!">
                        {item.title}
                        {item.key && item.route &&
                          <DictActionsMenu
                            dictId={item.key}
                            dictName={item.title}
                            route={item.route}
                          />
                        }
                      </div>
                    )}
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      <div className="gap-2">
                      {item.items.map((subItem) => {
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <div className="group/dict-subitem flex items-center justify-between">
                                {(subItem.url) &&
                                  <Link to={subItem.url} className="group flex items-center gap-4 text-current hover:text-background!">
                                    {subItem.icon && <subItem.icon size={12} />}
                                    {subItem.title}
                                  </Link>}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="shrink-0 hidden cursor-pointer group-hover/dict-subitem:inline-flex"
                                  title="Open in new window"
                                  aria-label={`Open ${subItem.title} in a new window`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (subItem.url) { window.api?.openNewWindow?.(subItem.url) };
                                  }}
                                >
                                  <ExternalLink className="size-3" />
                                </Button>
                              </div>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                      </div>
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </div>
            <div className="flex flex-row items-center px-4 mt-2">
              <AddDictModal></AddDictModal>
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
