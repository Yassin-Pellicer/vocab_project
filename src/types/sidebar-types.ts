export interface SidebarNode {
  id: string;
  title: string;
  children?: SidebarNode[];
}
export type SidebarTree = SidebarNode[];