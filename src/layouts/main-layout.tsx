import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./components/app-header";
import { useGlobalKeybinds } from "@/hooks/use-global-keybinds";

export function MainLayout({
  children,
  hideSidebar,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  useGlobalKeybinds();
  return (
    <SidebarProvider>
      {!hideSidebar && <AppSidebar />}
      <SidebarInset>
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
