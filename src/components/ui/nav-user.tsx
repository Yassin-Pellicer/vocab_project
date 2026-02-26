"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ConfigModal from "../config/config-modal";
import { Bell, User } from "lucide-react";

export function NavUser({
  user,
}: Readonly<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}>) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className="flex-row items-center mx-2 mt-2 border border-gray-200 dark:border-gray-700 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full bg-blue-500"><User className="h-4 w-4 text-white"/></AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <Bell size={16}></Bell>
          <ConfigModal></ConfigModal>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
