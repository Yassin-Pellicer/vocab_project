import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DictionaryContext } from "@/context/dictionary-context";
import type { GraphLink } from "@/types/graph-types";
import { buildGraphDataFromPayload } from "./graph-data-builder";
import type { GraphData } from "./types";
import { EMPTY_TRANSLATIONS, getLinkNodeId } from "./utils";

export function useKnowledgeGraph(
  route: string,
  name: string,
  title: string,
  word?: string,
  directOnly = false,
  selectedWordIdOverride?: string,
) {
  void word;
  void directOnly;
  void selectedWordIdOverride;

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showEmptyNodes, setShowEmptyNodes] = useState(false);
  const graphDataRef = useRef<GraphData | null>(null);

  const dictionaries = DictionaryContext((s) => s.dictionaries);

  const list = dictionaries[name] ?? EMPTY_TRANSLATIONS;

  const fetchGraph = useCallback(async () => {
    try {
      const response = (await window.api.fetchGraph(route, name)) as Record<
        string,
        Record<string, string>
      >;

      const prevNodes = graphDataRef.current?.nodes ?? [];
      setGraphData(
        buildGraphDataFromPayload({
          response,
          list,
          title,
          prevNodes,
        }),
      );
    } catch (error) {
      console.error("Error fetching graph:", error);
    }
  }, [list, name, route, title]);

  useEffect(() => {
    if (!route || !name || list.length === 0) return;
    void fetchGraph();
  }, [fetchGraph, list.length, name, route]);

  useEffect(() => {
    graphDataRef.current = graphData;
  }, [graphData]);

  useEffect(() => {
    const onGraphChanged = (
      _event: unknown,
      payload: { route?: string; name?: string } | undefined,
    ) => {
      if (!payload) return;
      if (payload.route !== route || payload.name !== name) return;
      void fetchGraph();
    };

    window.ipcRenderer.on("graph-changed", onGraphChanged);
    return () => {
      window.ipcRenderer.off("graph-changed", onGraphChanged);
    };
  }, [fetchGraph, name, route]);

  return {
    graphData,
    showEmptyNodes,
    setShowEmptyNodes,
    list,
  };
}

export function calculateNodeRadius(
  connectionCount: Map<string, number>,
  nodeId: string,
  isParent: boolean,
): number {
  if (isParent) return 6;
  const connections = connectionCount.get(nodeId) || 0;
  return Math.max(2, Math.min(4 + connections * 5, 50));
}

export function buildConnectionCount(links: GraphLink[]): Map<string, number> {
  const connectionCount = new Map<string, number>();
  links.forEach((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    connectionCount.set(sourceId, (connectionCount.get(sourceId) || 0) + 1);
    connectionCount.set(targetId, (connectionCount.get(targetId) || 0) + 1);
  });
  return connectionCount;
}
