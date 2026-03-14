
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from "@/components/ui/note-sidebar";
import { SidebarNode } from "@/types/sidebar-types";
import { useNotesStore } from "@/context/notes-context";
import useNoteMenu from "./hook";
import type { ReactNode } from "react";
import { filterTree } from "./utils";

function renderNode(
  n: SidebarNode,
  route: string,
  name: string,
  action?: (item: SidebarNode) => void,
  element?: (item: SidebarNode) => ReactNode
): ReactNode {
  if (!n.children?.length) {
  return <SidebarItem key={n.id} title={n.title} element={element} item={n} action={action} />;
  }
  return (
    <SidebarItem key={n.id} title={n.title} element={element} item={n} action={action}>
      {n.children.map((child) => renderNode(child, route, name, action, element))}
    </SidebarItem>
  );
}

export function NoteSidebar({
  route,
  name,
  className = "",
  action,
  element,
  query = "",
}: {
  route: string;
  name: string;
  className?: string;
  action?: (item: SidebarNode) => void;
  element?: (item: SidebarNode) => ReactNode;
  query?: string;
}) {
  const { tree } = useNotesStore();
  const safeTree = Array.isArray(tree) ? tree : [];
  const visibleTree = filterTree(safeTree, query);
  useNoteMenu({ route, name });
  
  return (
    <Sidebar className={className}>
      <SidebarContent>
        <SidebarGroup>
          {visibleTree.map((node) =>
            renderNode(node, route, name, action, element)
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
