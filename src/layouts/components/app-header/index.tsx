import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNavigation } from "../breadcrumb-navigation";
import { Maximize2, X, MoveDownLeft } from "lucide-react";

export function AppHeader() {
  return (
    <header
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="bg-background sticky justify-between top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"
    >
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <BreadcrumbNavigation />
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <button
          aria-label="Minimize"
          onClick={() => window.api?.minimize?.()}
          className="p-1 hover:bg-gray-200 rounded cursor-pointer">
          <MoveDownLeft size={14} />
        </button>
        <button
          aria-label="Maximize"
          onClick={() => window.api?.maximize?.()}
          className="p-1 hover:bg-gray-200 rounded cursor-pointer">
          <Maximize2 size={14} />
        </button>
        <button
          aria-label="Close"
          onClick={() => window.api?.close?.()}
          className="p-1 hover:bg-red-500 hover:text-white rounded cursor-pointer">
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
