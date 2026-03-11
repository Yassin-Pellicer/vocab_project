import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

export function Sidebar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={`h-full flex flex-col ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

export function SidebarGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarItem({
  title,
  children,
  element,
  item,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  element?: (item: any) => React.ReactNode;
  item: any;
  action?: any;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(children);

  return (
    <div onClick={(e) => { e.stopPropagation(); action && action(item) }} className="mb-0">
      <div className="group border-dashed border-b relative flex flex-row w-full items-center justify-between px-6 py-2 text-sm hover:bg-muted/10">
        <span className="absolute -left-4 top-1/2 w-6 h-2 border-l border-b rounded-bl-md transform -translate-y-1.5 -translate-x-[1.5px]"></span>
        <span>{title.length > 35 ? title.slice(0, 35) + "..." : title}</span>
        <div className="flex flex-row items-center ml-2">
          {hasChildren && (
            <span
              className="mr-2 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          <div className="w-6 flex justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {element?.(item)}
            </div>
          </div>
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-4 pl-4 border-l">
          {children}
        </div>
      )}
    </div>
  );
}