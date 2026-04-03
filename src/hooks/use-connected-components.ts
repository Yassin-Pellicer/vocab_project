import type { TranslationEntry } from "@/types/translation-entry";
import type { DictionaryConnectedComponent } from "@/types/connected-components";
import { useMemo } from "react";

const getEdgeKey = (sourceId: string, targetId: string) =>
  sourceId < targetId ? `${sourceId}__${targetId}` : `${targetId}__${sourceId}`;

const getEntryLabel = (entry: TranslationEntry) =>
  entry.pair[0]?.original?.word?.trim() || entry.uuid || "Unknown word";

const sortEntriesByPrimaryWord = (entries: TranslationEntry[]) =>
  [...entries].sort((a, b) =>
    getEntryLabel(a).localeCompare(getEntryLabel(b), undefined, {
      sensitivity: "base",
    }),
  );

export const buildConnectedComponents = (
  entries: TranslationEntry[],
): DictionaryConnectedComponent[] => {
  const entryById = new Map<string, TranslationEntry>();
  entries.forEach((entry) => {
    if (!entry.uuid) return;
    entryById.set(entry.uuid, entry);
  });

  if (entryById.size === 0) return [];

  const adjacency = new Map<string, Set<string>>();
  entryById.forEach((_entry, entryId) => {
    adjacency.set(entryId, new Set<string>());
  });

  entryById.forEach((entry, entryId) => {
    const linkedIds = entry.linkedWordIds ?? [];
    linkedIds.forEach((targetId) => {
      if (targetId === entryId) return;
      if (!entryById.has(targetId)) return;
      adjacency.get(entryId)?.add(targetId);
      adjacency.get(targetId)?.add(entryId);
    });
  });

  const orderedIds = [...entryById.keys()].sort((leftId, rightId) => {
    const leftLabel = getEntryLabel(entryById.get(leftId)!);
    const rightLabel = getEntryLabel(entryById.get(rightId)!);
    const labelCompare = leftLabel.localeCompare(rightLabel, undefined, {
      sensitivity: "base",
    });
    if (labelCompare !== 0) return labelCompare;
    return leftId.localeCompare(rightId, undefined, { sensitivity: "base" });
  });

  const visited = new Set<string>();
  const components: DictionaryConnectedComponent[] = [];

  orderedIds.forEach((startId) => {
    if (visited.has(startId)) return;

    const queue = [startId];
    const componentIds: string[] = [];
    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) continue;

      componentIds.push(currentId);
      const neighbors = adjacency.get(currentId);
      if (!neighbors) continue;

      [...neighbors]
        .sort((leftId, rightId) =>
          getEntryLabel(entryById.get(leftId)!).localeCompare(
            getEntryLabel(entryById.get(rightId)!),
            undefined,
            { sensitivity: "base" },
          ),
        )
        .forEach((neighborId) => {
          if (visited.has(neighborId)) return;
          visited.add(neighborId);
          queue.push(neighborId);
        });
    }

    const componentIdSet = new Set(componentIds);
    const words = sortEntriesByPrimaryWord(
      componentIds
        .map((id) => entryById.get(id))
        .filter((entry): entry is TranslationEntry => !!entry),
    );

    const edgeKeys = new Set<string>();
    componentIds.forEach((nodeId) => {
      const neighbors = adjacency.get(nodeId);
      if (!neighbors) return;
      neighbors.forEach((neighborId) => {
        if (!componentIdSet.has(neighborId)) return;
        edgeKeys.add(getEdgeKey(nodeId, neighborId));
      });
    });

    const connectionCount = edgeKeys.size;
    if (connectionCount === 0) return;
    if (words.length === 0) return;

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
};

export function useConnectedComponents(entries: TranslationEntry[]) {
  return useMemo(() => buildConnectedComponents(entries), [entries]);
}
