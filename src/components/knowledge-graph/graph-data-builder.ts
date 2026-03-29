import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";
import type { GraphData } from "./types";
import { ROOT_ID } from "./utils";

type GraphPayload = Record<string, Record<string, string>>;

const getPairKey = (sourceId: string, targetId: string) =>
  sourceId < targetId ? `${sourceId}__${targetId}` : `${targetId}__${sourceId}`;

export function buildGraphDataFromPayload({
  response,
  list,
  title,
  prevNodes,
}: {
  response: GraphPayload;
  list: TranslationEntry[];
  title: string;
  prevNodes: GraphNode[];
}): GraphData {
  const nodeIds = new Set<string>([ROOT_ID]);
  const links: GraphData["links"] = [];
  const seenLinkKeys = new Set<string>();

  Object.entries(response).forEach(([sourceId, targets]) => {
    nodeIds.add(sourceId);

    if (!targets || typeof targets !== "object") return;
    Object.keys(targets).forEach((targetId) => {
      if (sourceId === targetId) return;

      nodeIds.add(targetId);
      const pairKey = getPairKey(sourceId, targetId);
      if (seenLinkKeys.has(pairKey)) return;
      seenLinkKeys.add(pairKey);
      links.push({ source: sourceId, target: targetId });
    });
  });

  const prevNodeMap = new Map(prevNodes.map((node) => [node.id, node]));
  const nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
    if (id === ROOT_ID) {
      return { id: ROOT_ID, label: title, parent: true };
    }

    const wordData = list.find((entry) => entry.uuid === id);
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

  list.forEach((entry) => {
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

  return { nodes, links };
}

export function buildFilteredNodeIds({
  list,
  activeSearch,
  selectedTypes,
}: {
  list: TranslationEntry[];
  activeSearch: string;
  selectedTypes: string[];
}) {
  if (!list || list.length === 0) {
    return new Set<string>();
  }

  let results = list;

  if (activeSearch !== "") {
    const searchLower = activeSearch.toLowerCase();
    results = results.filter((entry) =>
      entry.pair.some(
        (pair) =>
          pair.original?.word?.toLowerCase().includes(searchLower) ||
          pair.translations?.some((translation) =>
            translation.word.toLowerCase().includes(searchLower),
          ),
      ),
    );
  }

  if (selectedTypes.length > 0) {
    results = results.filter(
      (entry) => entry.type && selectedTypes.includes(entry.type),
    );
  }

  return new Set(
    results
      .map((entry) => entry.uuid)
      .filter((uuid): uuid is string => uuid !== undefined),
  );
}
