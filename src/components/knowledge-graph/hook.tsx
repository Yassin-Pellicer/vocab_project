import { useEffect, useState, useMemo } from "react";
import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { GraphLink, GraphNode } from "@/types/graph-types";

const ROOT_ID = "__ROOT__";

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function useKnowledgeGraph(route: string, name: string, title: string) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showEmptyNodes, setShowEmptyNodes] = useState(false);

  const dictionaries = useConfigStore((s) => s.dictionaries);
  const searchField = useConfigStore((s) => s.searchField);
  const selectedTypes = useConfigStore((s) => s.selectedTypes);

  const list = dictionaries[name] || [];

  const filteredNodeIds = useMemo<Set<string>>(() => {
    if (!list || list.length === 0) {
      return new Set<string>();
    }

    let results = list;

    if (searchField.trim() !== "") {
      results = results.filter((word: TranslationEntry) =>
        word.pair.some(
          (p) =>
            p.original?.word
              .toLowerCase()
              .includes(searchField.toLowerCase()) ||
            p.translations?.some((t) =>
              t.word.toLowerCase().includes(searchField.toLowerCase()),
            ),
        ),
      );
    }

    if (selectedTypes.length > 0) {
      results = results.filter(
        (word: TranslationEntry) =>
          word.type && selectedTypes.includes(word.type),
      );
    }

    return new Set(
      results
        .map((word: TranslationEntry) => word.uuid)
        .filter((uuid): uuid is string => uuid !== undefined),
    );
  }, [list, searchField, selectedTypes]);

  const fetchGraph = async () => {
    try {
      const response = await (window as any).api.fetchGraph(route, name);

      const nodeIds = new Set<string>([ROOT_ID]);
      const links: GraphLink[] = [];
      const hasIncoming = new Set<string>();

      Object.entries(response).forEach(([sourceId, targets]: [string, any]) => {
        nodeIds.add(sourceId);

        if (targets && typeof targets === "object") {
          Object.keys(targets).forEach((targetId) => {
            nodeIds.add(targetId);
            hasIncoming.add(targetId);
            links.push({ source: sourceId, target: targetId });
          });
        }
      });

      Object.entries(response).forEach(([sourceId, targets]: [string, any]) => {
        const isEmpty =
          !targets ||
          (typeof targets === "object" && Object.keys(targets).length === 0);
        const isOrphan = isEmpty && !hasIncoming.has(sourceId);

        if (isOrphan) {
          links.push({ source: ROOT_ID, target: sourceId });
        }
      });

      const nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
        if (id === ROOT_ID) {
          return { id: ROOT_ID, label: title, parent: true };
        }

        const wordData = list.find(
          (entry: TranslationEntry) => entry.uuid === id,
        );
        return {
          id,
          label: wordData?.pair[0]?.original?.word ?? id,
          parent: false,
          wordData,
        };
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error("Error fetching graph:", error);
    }
  };

  useEffect(() => {
    if (route && name && list.length > 0) {
      fetchGraph();
    }
  }, [route, name, list]);

  useEffect(() => {
    fetchGraph();
  }, []);

  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;

    let { nodes, links } = graphData;
    let filteredNodes = nodes;
    let filteredLinks = links;

    if (searchField.trim() !== "" || selectedTypes.length > 0) {
      const matchingNodeIds = new Set<string>([ROOT_ID]);
      filteredNodeIds.forEach((id) => matchingNodeIds.add(id));

      links.forEach((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id;

        if (filteredNodeIds.has(sourceId)) {
          matchingNodeIds.add(targetId);
        }
        if (filteredNodeIds.has(targetId)) {
          matchingNodeIds.add(sourceId);
        }
      });

      filteredNodes = nodes.filter((node) => matchingNodeIds.has(node.id));

      const validNodeIds = new Set(filteredNodes.map((n) => n.id));
      filteredLinks = links.filter((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id;
        return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
      });
    }

    if (!showEmptyNodes) {
      const emptyNodeIds = new Set(
        filteredLinks
          .filter((link) => {
            const sourceId =
              typeof link.source === "string" ? link.source : link.source.id;
            return sourceId === ROOT_ID;
          })
          .map((link) =>
            typeof link.target === "string" ? link.target : link.target.id,
          ),
      );

      filteredNodes = filteredNodes.filter(
        (node) => node.id === ROOT_ID || !emptyNodeIds.has(node.id),
      );

      filteredLinks = filteredLinks.filter((link) => {
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id;
        return !emptyNodeIds.has(targetId);
      });
    }

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, showEmptyNodes, searchField, selectedTypes, filteredNodeIds]);

  return {
    graphData: filteredGraphData,
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
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;
    connectionCount.set(sourceId, (connectionCount.get(sourceId) || 0) + 1);
    connectionCount.set(targetId, (connectionCount.get(targetId) || 0) + 1);
  });
  return connectionCount;
}
