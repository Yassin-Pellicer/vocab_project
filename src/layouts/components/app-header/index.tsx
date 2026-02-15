import { Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AddDictModal from "@/components/dict/add-dict-modal";
import ConfigModal from "@/components/config/config-modal";
import { BreadcrumbNavigation } from "../breadcrumb-navigation";
// removed unused Link import

export function AppHeader() {
  return (
    <header
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="bg-background sticky justify-between top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <BreadcrumbNavigation />
      </div>

      <div className="flex flex-row items-center gap-2">
        <AddDictModal />
        <ConfigModal>
          <div className="rounded-xl px-2 border border-gray-300 flex h-8 items-center justify-center cursor-pointer hover:bg-gray-100">
            <Settings size={18} color="black" />
          </div>
        </ConfigModal>
      </div>
    </header>
  );
}
