import type { GraphData } from "./types";
import { ROOT_ID, getLinkNodeId } from "./utils";

const buildAdjacency = (links: GraphData["links"]) => {
  const adjacency = new Map<string, Set<string>>();
  links.forEach((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);

    if (!adjacency.has(sourceId)) {
      adjacency.set(sourceId, new Set<string>());
    }
    if (!adjacency.has(targetId)) {
      adjacency.set(targetId, new Set<string>());
    }

    adjacency.get(sourceId)!.add(targetId);
    adjacency.get(targetId)!.add(sourceId);
  });
  return adjacency;
};

const buildConnectedNodeIds = (links: GraphData["links"]) => {
  const connectedNodeIds = new Set<string>();
  links.forEach((link) => {
    connectedNodeIds.add(getLinkNodeId(link.source));
    connectedNodeIds.add(getLinkNodeId(link.target));
  });
  return connectedNodeIds;
};

const getDirectedLinkKey = (sourceId: string, targetId: string) => `${sourceId}__${targetId}`;

export function filterKnowledgeGraphData({
  graphData,
  showEmptyNodes,
  activeSearch,
  selectedTypes,
  filteredNodeIds,
  directOnly,
  selectedWordId,
}: {
  graphData: GraphData | null;
  showEmptyNodes: boolean;
  activeSearch: string;
  selectedTypes: string[];
  filteredNodeIds: Set<string>;
  directOnly: boolean;
  selectedWordId?: string;
}): GraphData | null {
  if (!graphData) return null;

  const { nodes, links } = graphData;
  let filteredNodes = nodes;
  let filteredLinks = links;

  if (activeSearch !== "" || selectedTypes.length > 0 || (directOnly && selectedWordId)) {
    const adjacency = buildAdjacency(links);

    const directAnchor = directOnly && selectedWordId
      ? new Set<string>([selectedWordId])
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
        const sourceId = getLinkNodeId(link.source);
        const targetId = getLinkNodeId(link.target);
        return directAnchor.has(sourceId) || directAnchor.has(targetId);
      });
    } else {
      const visited = new Set<string>(filteredNodeIds);
      const queue = Array.from(filteredNodeIds);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const neighbors = adjacency.get(currentId);
        if (!neighbors) continue;

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

      const validNodeIds = new Set(filteredNodes.map((node) => node.id));
      filteredLinks = links.filter((link) => {
        const sourceId = getLinkNodeId(link.source);
        const targetId = getLinkNodeId(link.target);
        return validNodeIds.has(sourceId) && validNodeIds.has(targetId);
      });
    }
  }

  const connectedNodeIds = buildConnectedNodeIds(filteredLinks);
  const hasFilter = activeSearch !== "" || selectedTypes.length > 0;
  const effectiveShowEmpty = showEmptyNodes || hasFilter;

  if (effectiveShowEmpty) {
    const isolatedCandidates = nodes.filter((node) => {
      if (connectedNodeIds.has(node.id)) return false;
      if (node.id === ROOT_ID) return false;
      if (hasFilter) return filteredNodeIds.has(node.id);
      return true;
    });

    const connectedNodes = filteredNodes.filter((node) => connectedNodeIds.has(node.id));
    filteredNodes = [...connectedNodes, ...isolatedCandidates];
  } else {
    filteredNodes = filteredNodes.filter((node) => connectedNodeIds.has(node.id));
  }

  filteredLinks = filteredLinks.filter((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId);
  });

  if (selectedWordId) {
    const fullAdjacency = buildAdjacency(links);
    const pinnedIds = new Set<string>([selectedWordId]);
    fullAdjacency.get(selectedWordId)?.forEach((neighborId) => {
      if (neighborId !== ROOT_ID) pinnedIds.add(neighborId);
    });

    const existingNodeIds = new Set(filteredNodes.map((node) => node.id));
    const existingLinkKeys = new Set(
      filteredLinks.map((link) => {
        const sourceId = getLinkNodeId(link.source);
        const targetId = getLinkNodeId(link.target);
        return getDirectedLinkKey(sourceId, targetId);
      }),
    );

    nodes.forEach((node) => {
      if (pinnedIds.has(node.id) && !existingNodeIds.has(node.id)) {
        filteredNodes = [...filteredNodes, node];
        existingNodeIds.add(node.id);
      }
    });

    links.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      const key = getDirectedLinkKey(sourceId, targetId);
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

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}
