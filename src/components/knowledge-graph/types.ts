import type { GraphLink, GraphNode } from "@/types/graph-types";
import type { DictionaryConnectedComponent } from "@/types/connected-components";
import type { TranslationEntry } from "@/types/translation-entry";

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type SelectionScope = "global" | "local";

export interface DictionaryGraphProps {
  route: string;
  name: string;
  title: string;
  word?: string;
  doubleView: boolean;
  showDirectToggle?: boolean;
  directOnlyOverride?: boolean;
  onDirectOnlyChange?: (value: boolean) => void;
  showBottomSelector?: boolean;
  autoSelectRandomWord?: boolean;
  selectionScope?: SelectionScope;
  initialWordId?: string;
  navigateOnWordClick?: boolean;
  onWordSelected?: (word: TranslationEntry) => void;
  showGoBackButton?: boolean;
  onSelectionCleared?: () => void;
}

export type ContextMenuState = {
  x: number;
  y: number;
  node: GraphNode;
};

export type EdgeSelection = {
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
};

export type GraphMenuItem = {
  node: GraphNode;
  neighbors: string[];
};

export type GraphMenuState = {
  anchorId: string | null;
  menuItems: GraphMenuItem[];
  menuQuery: string;
};

export type ConnectedComponentSummary = DictionaryConnectedComponent;
