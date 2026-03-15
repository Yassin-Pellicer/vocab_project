import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./components/app-header";
import { ChatWidget } from "@/components/chat/chat-widget";

export function MainLayout({
  children,
  hideSidebar,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  return (
    <SidebarProvider>
      {!hideSidebar && <AppSidebar />}
      <SidebarInset>
        <AppHeader />
        <main className="overflow-auto">{children}</main>
      </SidebarInset>
      <ChatWidget />
    </SidebarProvider>
  );
}
