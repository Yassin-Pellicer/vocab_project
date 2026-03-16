import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import ConfigModal from "../config/config-modal";
import { Bell, User } from "lucide-react";
import LoginDialog from "../auth/login-form";

export function NavUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    }
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center p-2">Loading...</div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className="flex-row items-center mx-2 mt-2 border border-gray-200 dark:border-gray-700
          data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
          flex gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl"
        >
          {user ? (
            <>
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.user_metadata?.avatar || ""}
                  alt={user.user_metadata?.name || user.email || "User"}
                />
                <AvatarFallback className="rounded-full bg-blue-500">
                  <User className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.user_metadata?.name || "User"}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <Bell
                size={16}
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              />
              <ConfigModal />
            </>
          ) : (
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex w-full">
                <LoginDialog />
              </div>
              <ConfigModal />
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}