import "./App.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "./components/nav-user";
import { Search, WholeWord, Book, MoreVertical } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* --- HEADER --- */}
        <header className="bg-background sticky justify-between top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex flex-row items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="ml-3 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="ml-3 h-4" />
          </div>
          <div>
            <NavUser
              user={{
                name: "John Doe",
                email: "john.doe@example.com",
                avatar: "",
              }}
            />
          </div>
        </header>

        

        {/* --- MAIN CONTENT --- */}
        <main className="overflow-auto">
          <Outlet /> {/* 👈 This is where pages load */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
