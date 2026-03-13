import { useNotesStore } from '@/context/notes-context';
import { useEffect } from 'react';
import type { SidebarNode } from "@/types/sidebar-types";

export function matchesQuery(title: string, query: string) {
  return title.toLowerCase().includes(query.toLowerCase());
}

export function filterTree(nodes: SidebarNode[], query: string): SidebarNode[] {
  const trimmed = query.trim();
  if (!trimmed) return nodes;

  const result: SidebarNode[] = [];
  for (const node of nodes) {
    const selfMatches = matchesQuery(node.title, trimmed);
    if (selfMatches) {
      result.push(node);
      continue;
    }

    const children = node.children?.length
      ? filterTree(node.children, trimmed)
      : [];

    if (children.length) {
      result.push({ ...node, children });
    }
  }

  return result;
}

export default function NoteMenuHook({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const { setTree } = useNotesStore();

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const indexData = await window.api.fetchNoteIndex(route, name);
        console.log("Fetched note index:", indexData);
        setTree(indexData);
      } catch (error) {
        console.error("Error fetching note index:", error);
      }
    };

    fetchIndex();
  }, [route, name]);

  return {};
}
