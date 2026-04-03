import type { TranslationEntry } from "@/types/translation-entry";
import { getEdgeKey, getEntryLabel } from "./game-utils";
import type { TranslationGameConnectedComponent } from "./types";

export const buildConnectedComponents = (
  entries: TranslationEntry[],
): TranslationGameConnectedComponent[] => {
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
  const components: TranslationGameConnectedComponent[] = [];

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

    const representativeId = [...componentIds].sort((leftId, rightId) => {
      const leftDegree = adjacency.get(leftId)?.size ?? 0;
      const rightDegree = adjacency.get(rightId)?.size ?? 0;
      if (leftDegree !== rightDegree) return rightDegree - leftDegree;
      return getEntryLabel(entryById.get(leftId)!).localeCompare(
        getEntryLabel(entryById.get(rightId)!),
        undefined,
        { sensitivity: "base" },
      );
    })[0];

    components.push({
      id: `component-${componentIds.slice().sort().join("-")}`,
      nodeIds: componentIds,
      wordCount: componentIds.length,
      connectionCount,
      representativeLabel: representativeId
        ? getEntryLabel(entryById.get(representativeId)!)
        : getEntryLabel(entryById.get(startId)!),
    });
  });

  return components.sort((left, right) => {
    if (left.wordCount !== right.wordCount) {
      return right.wordCount - left.wordCount;
    }
    if (left.connectionCount !== right.connectionCount) {
      return right.connectionCount - left.connectionCount;
    }
    return left.representativeLabel.localeCompare(right.representativeLabel, undefined, {
      sensitivity: "base",
    });
  });
};
