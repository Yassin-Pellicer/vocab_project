import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { GraphLink, GraphNode } from "@/types/graph-types";

const ROOT_ID = "__ROOT__";
const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function useKnowledgeGraph(
  route: string,
  name: string,
  title: string,
  word?: string,
  directOnly = false,
) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showEmptyNodes, setShowEmptyNodes] = useState(false);
  const graphDataRef = useRef<GraphData | null>(null);

  const dictionaries = DictionaryContext((s) => s.dictionaries);
  const searchField = DictionaryContext((s) => s.searchField);
  const selectedTypes = DictionaryContext((s) => s.selectedTypes);
  const selectedWord = DictionaryContext((s) => s.selectedWord);

  const list = dictionaries[name] ?? EMPTY_TRANSLATIONS;

  const filteredNodeIds = useMemo<Set<string>>(() => {
    if (!list || list.length === 0) {
      return new Set<string>();
    }

    let results = list;

    const activeSearch = word !== undefined ? word.trim() : searchField.trim();

    if (activeSearch !== "") {
      const searchLower = activeSearch.toLowerCase();

      results = results.filter((entry: TranslationEntry) =>
        entry.pair.some(
          (p) =>
            p.original?.word?.toLowerCase().includes(searchLower) ||
            p.translations?.some((t) =>
              t.word.toLowerCase().includes(searchLower),
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
  }, [list, searchField, selectedTypes, word]);

  const fetchGraph = useCallback(async () => {
    try {
      const response =
        (await window.api.fetchGraph(route, name)) as Record<
          string,
          Record<string, string>
        >;

      const nodeIds = new Set<string>([ROOT_ID]);
      const links: GraphLink[] = [];
      const seenLinkKeys = new Set<string>();

      Object.entries(response).forEach(([sourceId, targets]) => {
        nodeIds.add(sourceId);

        if (targets && typeof targets === "object") {
          Object.keys(targets).forEach((targetId) => {
            if (sourceId === targetId) return;

            nodeIds.add(targetId);
            const pairKey =
              sourceId < targetId
                ? `${sourceId}__${targetId}`
                : `${targetId}__${sourceId}`;
            if (seenLinkKeys.has(pairKey)) return;
            seenLinkKeys.add(pairKey);
            links.push({ source: sourceId, target: targetId });
          });
        }
      });

      const prevNodes = graphDataRef.current?.nodes ?? [];
      const prevNodeMap = new Map(prevNodes.map((node) => [node.id, node]));

      const nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
        if (id === ROOT_ID) {
          return { id: ROOT_ID, label: title, parent: true };
        }

        const wordData = list.find(
          (entry: TranslationEntry) => entry.uuid === id,
        );
        const next: GraphNode = {
          id,
          label: wordData?.pair[0]?.original?.word ?? id,
          parent: false,
          wordData,
        };
        const prev = prevNodeMap.get(id);
        if (prev) {
          next.x = prev.x;
          next.y = prev.y;
          next.fx = prev.fx;
          next.fy = prev.fy;
        }
        return next;
      });

      // Also add dictionary entries that have no graph entry at all (truly unconnected words)
      list.forEach((entry: TranslationEntry) => {
        if (!entry.uuid) return;
        if (nodeIds.has(entry.uuid)) return;
        const prev = prevNodeMap.get(entry.uuid);
        const next: GraphNode = {
          id: entry.uuid,
          label: entry.pair[0]?.original?.word ?? entry.uuid,
          parent: false,
          wordData: entry,
        };
        if (prev) {
          next.x = prev.x;
          next.y = prev.y;
          next.fx = prev.fx;
          next.fy = prev.fy;
        }
        nodes.push(next);
      });

      setGraphData({ nodes, links });
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

  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;

    const { nodes, links } = graphData;
    let filteredNodes = nodes;
    let filteredLinks = links;
    const activeSearch = word?.trim() || searchField.trim();

    const selectedWordId = selectedWord?.uuid;
    if (activeSearch !== "" || selectedTypes.length > 0 || (directOnly && selectedWordId)) {
      const adjacency = new Map<string, Set<string>>();

      links.forEach((link) => {
        const sourceId =
          typeof link.source === "string" ? link.source : link.source.id;
        const targetId =
          typeof link.target === "string" ? link.target : link.target.id;

        if (!adjacency.has(sourceId)) {
          adjacency.set(sourceId, new Set<string>());
        }
        if (!adjacency.has(targetId)) {
          adjacency.set(targetId, new Set<string>());
        }

        adjacency.get(sourceId)!.add(targetId);
        adjacency.get(targetId)!.add(sourceId);
      });

      // When directOnly is on, always anchor on the selected word — never on search results.
      // Search still applies to the non-direct (all-relations) branch below.
      const directAnchor = directOnly && selectedWord?.uuid
        ? new Set<string>([selectedWord.uuid])
        : null;

      if (directOnly && directAnchor && directAnchor.size > 0) {
        const directIds = new Set<string>(directAnchor);
        directAnchor.forEach((anchorId) => {
          const neighbors = adjacency.get(anchorId);
          if (!neighbors) return;
          neighbors.forEach((neighborId) => {
            if (neighborId === ROOT_ID) return;
            directIds.add(neighborId);
          });
        });

        filteredNodes = nodes.filter((node) => directIds.has(node.id));
        filteredLinks = links.filter((link) => {
          const sourceId =
            typeof link.source === "string" ? link.source : link.source.id;
          const targetId =
            typeof link.target === "string" ? link.target : link.target.id;
          return directAnchor.has(sourceId) || directAnchor.has(targetId);
        });
      } else {
        const visited = new Set<string>(filteredNodeIds);
        const queue = Array.from(filteredNodeIds);

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const neighbors = adjacency.get(currentId);
          if (!neighbors) {
            continue;
          }

          neighbors.forEach((neighborId) => {
            if (neighborId === ROOT_ID || visited.has(neighborId)) {
              return;
            }

            visited.add(neighborId);
            queue.push(neighborId);
          });
        }

        const matchingNodeIds = new Set<string>([ROOT_ID, ...visited]);

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
    }

    // Identify which nodes are connected (appear in at least one link)
    const connectedNodeIds = new Set<string>();
    filteredLinks.forEach((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    });

    // Show isolated nodes when:
    //   - the user has explicitly toggled showEmptyNodes on, OR
    //   - a search / type filter is active (auto-on so matches with no connections are visible)
    const hasFilter = activeSearch !== "" || selectedTypes.length > 0;
    const effectiveShowEmpty = showEmptyNodes || hasFilter;

    if (effectiveShowEmpty) {
      // Pull isolated candidates from the full node list (not just filteredNodes,
      // which at this point only contains nodes reachable via links)
      const isolatedCandidates = nodes.filter((node) => {
        if (connectedNodeIds.has(node.id)) return false;
        if (node.id === ROOT_ID) return false;
        if (hasFilter) return filteredNodeIds.has(node.id);
        return true; // showEmptyNodes with no filter → all disconnected
      });

      const connectedNodes = filteredNodes.filter((node) => connectedNodeIds.has(node.id));
      filteredNodes = [...connectedNodes, ...isolatedCandidates];
    } else {
      filteredNodes = filteredNodes.filter((node) =>
        connectedNodeIds.has(node.id),
      );
    }

    filteredLinks = filteredLinks.filter((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;
      return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId);
    });

    // Always show the selected word and its direct neighbors, even if filtered out.
    // Build a full adjacency from the unfiltered links for this lookup.
    const selectedId = selectedWord?.uuid;
    if (selectedId) {
      const fullAdjacency = new Map<string, Set<string>>();
      links.forEach((link) => {
        const sourceId = typeof link.source === "string" ? link.source : link.source.id;
        const targetId = typeof link.target === "string" ? link.target : link.target.id;
        if (!fullAdjacency.has(sourceId)) fullAdjacency.set(sourceId, new Set());
        if (!fullAdjacency.has(targetId)) fullAdjacency.set(targetId, new Set());
        fullAdjacency.get(sourceId)!.add(targetId);
        fullAdjacency.get(targetId)!.add(sourceId);
      });

      const pinnedIds = new Set<string>([selectedId]);
      fullAdjacency.get(selectedId)?.forEach((neighborId) => {
        if (neighborId !== ROOT_ID) pinnedIds.add(neighborId);
      });

      const existingNodeIds = new Set(filteredNodes.map((n) => n.id));
      const existingLinkKeys = new Set(
        filteredLinks.map((l) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return `${s}__${t}`;
        }),
      );

      // Add missing pinned nodes
      nodes.forEach((node) => {
        if (pinnedIds.has(node.id) && !existingNodeIds.has(node.id)) {
          filteredNodes = [...filteredNodes, node];
          existingNodeIds.add(node.id);
        }
      });

      // Add missing links between pinned nodes
      links.forEach((link) => {
        const sourceId = typeof link.source === "string" ? link.source : link.source.id;
        const targetId = typeof link.target === "string" ? link.target : link.target.id;
        const key = `${sourceId}__${targetId}`;
        if (
          pinnedIds.has(sourceId) &&
          pinnedIds.has(targetId) &&
          !existingLinkKeys.has(key)
        ) {
          filteredLinks = [...filteredLinks, link];
          existingLinkKeys.add(key);
        }
      });
    }

    return { nodes: filteredNodes, links: filteredLinks };
  }, [
    graphData,
    showEmptyNodes,
    searchField,
    selectedTypes,
    filteredNodeIds,
    word,
    directOnly,
    selectedWord?.uuid,
  ]);

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
