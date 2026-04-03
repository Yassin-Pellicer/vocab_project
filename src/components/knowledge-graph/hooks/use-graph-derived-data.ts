import { useMemo } from "react";
import { useConnectedComponents } from "@/hooks/use-connected-components";
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

  const componentSourceEntries = useMemo(() => {
    if (!graphData) return [] as TranslationEntry[];

    const seenIds = new Set<string>();
    return graphData.nodes
      .filter((node): node is GraphNode & { wordData: TranslationEntry } =>
        !node.parent && Boolean(node.wordData?.uuid),
      )
      .map((node) => node.wordData)
      .filter((entry) => {
        const entryId = entry.uuid;
        if (!entryId) return false;
        if (seenIds.has(entryId)) return false;
        seenIds.add(entryId);
        return true;
      });
  }, [graphData]);

  const allConnectedComponents = useConnectedComponents(componentSourceEntries);

  const connectedComponents = useMemo<ConnectedComponentSummary[]>(() => {
    if (!graphData) return [];
    const query = searchField.trim();
    if (!query) return allConnectedComponents;

    return allConnectedComponents.filter((component) =>
      component.words.some((entry) => entryMatchesQuery(entry, query)),
    );
  }, [allConnectedComponents, graphData, searchField]);

  return {
    menuQuery,
    menuState,
    // Only surface the explore menu when a word is selected but the anchor
    // cannot be resolved in the current graph state.
    showMenu: Boolean(selectedWordUuid) && !menuState.anchorId,
    connectedWordEntries,
    dictionaryEntries,
    linkedIdsByWord,
    linkableEntries,
    connectedComponents,
  };
}
