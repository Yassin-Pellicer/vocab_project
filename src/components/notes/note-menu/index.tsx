
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from "@/components/ui/note-sidebar";
import { SidebarNode } from "@/types/sidebar-types";
import { useNotesStore } from "@/context/notes-context";
import NoteMenuHook from "./hook";

function renderNode(
  n: SidebarNode,
  route: string,
  name: string,
  action?: any,
  element?: (item: SidebarNode) => React.ReactNode
): React.ReactNode {
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
}: {
  route: string;
  name: string;
  className?: string;
  action?: any;
  element?: (item: SidebarNode) => React.ReactNode;
}) {
  const { tree } = useNotesStore();
  const safeTree = Array.isArray(tree) ? tree : [];
  NoteMenuHook({route, name})
  
  return (
    <Sidebar className={className}>
      <SidebarContent>
        <SidebarGroup>
          {safeTree.map((node) =>
            renderNode(node, route, name, action, element)
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}