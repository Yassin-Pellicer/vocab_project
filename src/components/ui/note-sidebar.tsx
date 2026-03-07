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
  return <div className="flex-1 overflow-y-auto p-0.5">{children}</div>;
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
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(children);

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm rounded-md hover:bg-muted/10"
      >
        <span>{title}</span>
        {hasChildren && (
          <span>{open ? <ChevronDown size={12}></ChevronDown> : <ChevronRight size={12}></ChevronRight>}</span>
        )}
      </button>

      {hasChildren && open && (
        <div className="ml-4 border-l pl-2">{children}</div>
      )}
    </div>
  );
}