// Layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AddDictModal from "./components/dict/add-dict-modal";
import { Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import useConfigStore from "./context/dictionary-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data } = useConfigStore();

  const name = searchParams.get("name") || "";
  const path = searchParams.get("path") || "";

  // Find the dictionary name from config
  const dictionaryName = data.navMain.find((item) =>
    item.items?.some((subItem) => {
      const itemParams = new URLSearchParams(subItem.url.split("?")[1]);
      return itemParams.get("name") === name;
    })
  )?.title;

  const selectedWord = useConfigStore((state) => state.selectedWord);

  const getCurrentPage = () => {
    if (location.pathname === "/dictionary") return "Dictionary";
    if (location.pathname === "/translation") return "Translate";
    if (location.pathname === "/markdown" && selectedWord) return selectedWord.original;
    return null;
  };

  const currentPage = getCurrentPage();
  const showBreadcrumbs = dictionaryName && currentPage;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
          className="bg-background sticky justify-between top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            {showBreadcrumbs && (
              <Breadcrumb>
                <BreadcrumbList>
                  {location.pathname === "/markdown" ? (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/dictionary?name=${encodeURIComponent(name)}&path=${encodeURIComponent(path)}`}>
                            {dictionaryName}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/dictionary?name=${encodeURIComponent(name)}&path=${encodeURIComponent(path)}`}>
                            Dictionary
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  ) : (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/dictionary?name=${encodeURIComponent(name)}&path=${encodeURIComponent(path)}`}>
                            {dictionaryName}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="flex flex-row items-center gap-4">
              <AddDictModal></AddDictModal>
              <div className="bg-black flex flex-row items-center py-2 rounded-xl px-2 gap-2">
                <Settings size={18} className="!text-white" />
              </div>
            </div>
          </div>
        </header>
        <main className="overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
