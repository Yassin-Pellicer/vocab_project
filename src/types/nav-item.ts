interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  key?: string;
  route?: string;
  items?: NavItem[];
}