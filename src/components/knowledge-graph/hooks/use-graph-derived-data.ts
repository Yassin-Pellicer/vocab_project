import { useMemo } from "react";
import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";
import type {
  ConnectedComponentSummary,
  GraphData,
  GraphMenuState,
} from "../types";
import {
  entryMatchesQuery,
  getEntryLabel,
  getEdgeKey,
  getLinkNodeId,
  nodeMatchesQuery,
  normalizeWord,
  sortEntriesByPrimaryWord,
} from "../utils";

type UseGraphDerivedDataParams = {
  graphData: GraphData | null;
  searchField: string;
  word?: string;
  selectedWordUuid?: string;
  forceMenu: boolean;
  dictionaries: Record<string, TranslationEntry[] | undefined>;
  name: string;
  linkSourceNode: GraphNode | null;
  linkSearchValue: string;
};

const buildMenuState = ({
  graphData,
  menuQuery,
  selectedWordUuid,
  word,
  forceMenu,
}: {
  graphData: GraphData | null;
  menuQuery: string;
  selectedWordUuid?: string;
  word?: string;
  forceMenu: boolean;
}): GraphMenuState => {
  if (!graphData) {
    return { anchorId: null, menuItems: [], menuQuery };
  }

  const { nodes, links } = graphData;
  const connectedIds = new Set<string>();
  links.forEach((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    connectedIds.add(sourceId);
    connectedIds.add(targetId);
  });

  const connectedNodes = nodes.filter(
    (node) => connectedIds.has(node.id) && !node.parent && node.wordData,
  );
  const allWordNodes = nodes.filter((node) => !node.parent && node.wordData);
  const menuSourceNodes = menuQuery ? allWordNodes : connectedNodes;
  const sortedMenuNodes = [...menuSourceNodes].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );

  const filteredMenuNodes = menuQuery
    ? sortedMenuNodes.filter((node) => nodeMatchesQuery(node, menuQuery))
    : sortedMenuNodes;

  let anchorId: string | null = null;
  if (selectedWordUuid) {
    anchorId = selectedWordUuid;
  } else if (word && word.trim()) {
    const exactMatches = sortedMenuNodes.filter((node) =>
      nodeMatchesQuery(node, word, true),
    );
    if (exactMatches.length === 1) {
      anchorId = exactMatches[0].id;
    } else if (filteredMenuNodes.length === 1) {
      anchorId = filteredMenuNodes[0].id;
    }
  }

  if (anchorId && !nodes.some((node) => node.id === anchorId)) {
    anchorId = null;
  }

  const adjacency = new Map<string, Set<string>>();
  links.forEach((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    if (sourceId === targetId) return;
    if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set<string>());
    if (!adjacency.has(targetId)) adjacency.set(targetId, new Set<string>());
    adjacency.get(sourceId)!.add(targetId);
    adjacency.get(targetId)!.add(sourceId);
  });

  return {
    anchorId: forceMenu ? null : anchorId,
    menuItems: filteredMenuNodes.map((node) => ({
      node,
      neighbors: Array.from(adjacency.get(node.id) ?? []).filter((id) => id !== node.id),
    })),
    menuQuery,
  };
};

export function useGraphDerivedData({
  graphData,
  searchField,
  word,
  selectedWordUuid,
  forceMenu,
  dictionaries,
  name,
  linkSourceNode,
  linkSearchValue,
}: UseGraphDerivedDataParams) {
  const menuQuery = useMemo(() => {
    if (typeof word === "string") return word.trim();
    return searchField.trim();
  }, [searchField, word]);

  const menuState = useMemo(
    () =>
      buildMenuState({
        graphData,
        menuQuery,
        selectedWordUuid,
        word,
        forceMenu,
      }),
    [forceMenu, graphData, menuQuery, selectedWordUuid, word],
  );

  const connectedWordEntries = useMemo(() => {
    if (!graphData) return [];
    const connectedIds = new Set<string>();
    graphData.links.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      connectedIds.add(sourceId);
      connectedIds.add(targetId);
    });

    return sortEntriesByPrimaryWord(
      graphData.nodes
        .filter((node) => connectedIds.has(node.id) && node.wordData)
        .map((node) => node.wordData as TranslationEntry),
    );
  }, [graphData]);

  const dictionaryEntries = useMemo(() => {
    return [...(dictionaries[name] ?? [])]
      .filter((entry): entry is TranslationEntry => !!entry?.uuid)
      .sort((a, b) =>
        getEntryLabel(a).localeCompare(getEntryLabel(b), undefined, {
          sensitivity: "base",
        }),
      );
  }, [dictionaries, name]);

  const linkedIdsByWord = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!graphData) return map;

    graphData.links.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (sourceId === targetId) return;
      if (!map.has(sourceId)) map.set(sourceId, new Set<string>());
      if (!map.has(targetId)) map.set(targetId, new Set<string>());
      map.get(sourceId)!.add(targetId);
      map.get(targetId)!.add(sourceId);
    });

    return map;
  }, [graphData]);

  const linkableEntries = useMemo(() => {
    const sourceId = linkSourceNode?.wordData?.uuid;
    if (!sourceId) return [] as TranslationEntry[];
    const alreadyLinked = linkedIdsByWord.get(sourceId) ?? new Set<string>();
    const searchTerm = normalizeWord(linkSearchValue);

    return dictionaryEntries.filter((entry) => {
      const entryId = entry.uuid;
      if (!entryId || entryId === sourceId) return false;
      if (alreadyLinked.has(entryId)) return false;
      return entryMatchesQuery(entry, searchTerm);
    });
  }, [dictionaryEntries, linkSearchValue, linkSourceNode?.wordData?.uuid, linkedIdsByWord]);

  const connectedComponents = useMemo<ConnectedComponentSummary[]>(() => {
    if (!graphData) return [];

    const wordById = new Map<string, TranslationEntry>();
    graphData.nodes.forEach((node) => {
      if (!node.parent && node.wordData?.uuid) {
        wordById.set(node.wordData.uuid, node.wordData);
      }
    });

    const adjacency = new Map<string, Set<string>>();
    const uniqueEdges: Array<{ sourceId: string; targetId: string }> = [];
    const seenEdgeKeys = new Set<string>();

    graphData.links.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (sourceId === targetId) return;
      if (!wordById.has(sourceId) || !wordById.has(targetId)) return;

      if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set<string>());
      if (!adjacency.has(targetId)) adjacency.set(targetId, new Set<string>());
      adjacency.get(sourceId)!.add(targetId);
      adjacency.get(targetId)!.add(sourceId);

      const edgeKey = getEdgeKey(sourceId, targetId);
      if (!seenEdgeKeys.has(edgeKey)) {
        seenEdgeKeys.add(edgeKey);
        uniqueEdges.push({ sourceId, targetId });
      }
    });

    const orderedIds = [...wordById.keys()].sort((leftId, rightId) => {
      const leftLabel = getEntryLabel(wordById.get(leftId)!);
      const rightLabel = getEntryLabel(wordById.get(rightId)!);
      const labelCompare = leftLabel.localeCompare(rightLabel, undefined, {
        sensitivity: "base",
      });
      if (labelCompare !== 0) return labelCompare;
      return leftId.localeCompare(rightId, undefined, { sensitivity: "base" });
    });

    const visited = new Set<string>();
    const components: ConnectedComponentSummary[] = [];
    const query = searchField.trim().toLowerCase();

    orderedIds.forEach((startId) => {
      if (visited.has(startId)) return;

      const queue = [startId];
      const componentIds: string[] = [];
      visited.add(startId);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        componentIds.push(currentId);
        const neighbors = adjacency.get(currentId);
        if (!neighbors) continue;
        [...neighbors]
          .sort((leftId, rightId) => {
            const leftLabel = getEntryLabel(wordById.get(leftId)!);
            const rightLabel = getEntryLabel(wordById.get(rightId)!);
            return leftLabel.localeCompare(rightLabel, undefined, {
              sensitivity: "base",
            });
          })
          .forEach((neighborId) => {
            if (visited.has(neighborId)) return;
            visited.add(neighborId);
            queue.push(neighborId);
          });
      }

      const componentIdSet = new Set(componentIds);
      const words = sortEntriesByPrimaryWord(
        componentIds
          .map((id) => wordById.get(id))
          .filter((entry): entry is TranslationEntry => !!entry),
      );

      const connectionCount = uniqueEdges.reduce((count, edge) => {
        if (componentIdSet.has(edge.sourceId) && componentIdSet.has(edge.targetId)) {
          return count + 1;
        }
        return count;
      }, 0);

      if (connectionCount === 0) return;
      if (words.length === 0) return;
      if (query && !words.some((entry) => entryMatchesQuery(entry, query))) return;

      const representative = [...words].sort((leftEntry, rightEntry) => {
        const leftId = leftEntry.uuid ?? "";
        const rightId = rightEntry.uuid ?? "";
        const leftDegree = adjacency.get(leftId)?.size ?? 0;
        const rightDegree = adjacency.get(rightId)?.size ?? 0;
        if (leftDegree !== rightDegree) return rightDegree - leftDegree;
        return getEntryLabel(leftEntry).localeCompare(getEntryLabel(rightEntry), undefined, {
          sensitivity: "base",
        });
      })[0];

      components.push({
        id: `component-${componentIds.slice().sort().join("-")}`,
        nodeIds: componentIds,
        words,
        representative,
        connectionCount,
      });
    });

    return components.sort((left, right) => {
      if (left.words.length !== right.words.length) {
        return right.words.length - left.words.length;
      }
      if (left.connectionCount !== right.connectionCount) {
        return right.connectionCount - left.connectionCount;
      }
      return getEntryLabel(left.representative).localeCompare(
        getEntryLabel(right.representative),
        undefined,
        { sensitivity: "base" },
      );
    });
  }, [graphData, searchField]);

  return {
    menuQuery,
    menuState,
    showMenu: !menuState.anchorId,
    connectedWordEntries,
    dictionaryEntries,
    linkedIdsByWord,
    linkableEntries,
    connectedComponents,
  };
}
