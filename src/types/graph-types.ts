import { TranslationEntry } from "./translation-entry";

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  parent?: boolean;
  wordData?: TranslationEntry;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}
