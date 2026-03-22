import { NotesContext } from '@/context/notes-context';
import { useEffect } from 'react';
import type { SidebarTree } from "@/types/sidebar-types";

export default function useNoteMenu({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const { setTree } = NotesContext();

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const indexData = await window.api.fetchNoteIndex(route, name);
        const nextTree: SidebarTree = Array.isArray(indexData)
          ? (indexData as SidebarTree)
          : [];
        setTree(nextTree);
      } catch (error) {
        console.error("Error fetching note index:", error);
      }
    };

    fetchIndex();
  }, [route, name, setTree]);

  return {};
}
