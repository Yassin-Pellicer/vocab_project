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

        {/* --- SEARCH BAR --- */}
        <div className="bg-background flex justify-between items-center h-16 border-b px-4">
          <div className="flex flex-row gap-2 items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a word"
                className="w-full border-2 border-gray-300 py-1 pl-10 pr-4 rounded-lg text-gray-700 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="flex flex-row items-center gap-4">
              <div className="bg-blue-600 rounded-lg px-2 flex h-8 items-center justify-center cursor-pointer">
                <WholeWord color="white" size={18} />
                <p className="text-lg text-white leading-none pb-1">+</p>
              </div>
              <div className="bg-black rounded-lg px-2 flex h-8 items-center justify-center cursor-pointer">
                <Book color="white" size={18} />
                <p className="text-lg text-white leading-none pb-1">+</p>
              </div>
              <div className="bg-gray-100 flex flex-row items-center py-2 rounded-xl px-2 gap-2">
                <Book size={16} />
                <p className="text-sm">German</p>
                <MoreVertical size={18} className="ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="overflow-auto">
          <Outlet /> {/* 👈 This is where pages load */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
