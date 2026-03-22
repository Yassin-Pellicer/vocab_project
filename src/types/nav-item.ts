import type { ElementType } from "react";

export interface NavItem {
  title: string;
  url?: string;
  icon?: ElementType;
  key?: string;
  route?: string;
  items?: NavItem[];
}
