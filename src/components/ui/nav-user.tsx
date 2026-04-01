import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import ConfigModal from "../config/config-modal";
import { User } from "lucide-react";
import LoginDialog from "../auth/login-form";

const AVATAR_STORAGE_KEY = "user_avatar_local";

export function NavUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      loadAvatar(sessionUser?.id);
      setLoading(false);
    }

    function loadAvatar(userId: string | undefined) {
      if (!userId) return;
      try {
        const stored = localStorage.getItem(`${AVATAR_STORAGE_KEY}_${userId}`);
        setAvatarDataUrl(stored ?? null);
      } catch {
      }
    }

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      loadAvatar(sessionUser?.id);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <></>
    );
  }

  const displayName = user?.user_metadata?.display_name ?? user?.email ?? "Unknown";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className="flex-row items-center h-16 border-b border-gray-200 dark:border-gray-700
          data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
          flex gap-2 px-4 bg-accent/5"
        >
          {user ? (
            <div className="flex flex-row gap-2 text-center w-full items-center">
              <div className="relative group/avatar">
                {avatarDataUrl && (
                  <img
                    src={avatarDataUrl}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                {!avatarDataUrl && (
                  <Avatar className="h-10 w-10 rounded-full shrink-0">
                    <AvatarFallback className="flex items-center justify-center rounded-full bg-accent">
                      <User className="h-5 w-5 text-background rounded-full shrink-0" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-foreground/80">{user.email}</span>
              </div>
              <ConfigModal />
            </div>
          ) : (
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row gap-2 text-center w-full items-center">
                <LoginDialog />
                <p className="text-xs mx-2"><b>Sign up</b> to enhance your experience!</p>
              </div>
              <ConfigModal />
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
