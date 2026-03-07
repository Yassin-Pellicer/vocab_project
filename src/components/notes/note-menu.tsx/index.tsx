
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from "@/components/ui/note-sidebar";
import NoteMenuHook from "./hook";
import { SidebarNode } from "@/types/sidebar-types";
import { useNotesStore } from "@/context/notes-context";


function renderNode(n: SidebarNode): React.ReactNode {
  if (!n.children?.length) {
    return <SidebarItem key={n.id} title={n.title} />;
  }
  return (
    <SidebarItem key={n.id} title={n.title}>
      {n.children.map(renderNode)}
    </SidebarItem>
  );
}

export function NoteSidebar({ route, name, className = "" }: { route: string; name: string; className?: string }) {
  const {  } = NoteMenuHook({route, name});
  const { tree } = useNotesStore();

  return (
    <Sidebar className={className}>
      <SidebarContent>
        <SidebarGroup>
          {tree.map(renderNode)}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}          