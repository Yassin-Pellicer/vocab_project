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

