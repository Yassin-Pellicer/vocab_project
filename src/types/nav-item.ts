interface NavItem {
  title: string;
  url: string;
  icon?: string;
  key?: string;
  route?: string;
  items?: NavItem[];
}