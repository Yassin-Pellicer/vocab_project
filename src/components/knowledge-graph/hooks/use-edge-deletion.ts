import { useCallback, useState } from "react";
import type { GraphData, EdgeSelection } from "../types";
import { getEdgeKey, getLinkNodeId } from "../utils";

type UseEdgeDeletionParams = {
  route: string;
  name: string;
};

export function useEdgeDeletion({ route, name }: UseEdgeDeletionParams) {
  const [selectedEdge, setSelectedEdge] = useState<EdgeSelection | null>(null);
  const [isDeletingEdge, setIsDeletingEdge] = useState(false);

  const closeDeleteConnectionModal = useCallback(() => {
    if (isDeletingEdge) return;
    setSelectedEdge(null);
  }, [isDeletingEdge]);

  const clearSelectedEdge = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  const handleDeleteConnection = useCallback(async () => {
    if (!selectedEdge || isDeletingEdge) return;
    setIsDeletingEdge(true);
    try {
      await window.api.deleteGraphEntry(
        route,
        name,
        { uuid: selectedEdge.sourceId },
        { uuid: selectedEdge.targetId },
      );
      setSelectedEdge(null);
    } catch (error) {
      console.error("Failed to delete graph connection:", error);
    } finally {
      setIsDeletingEdge(false);
    }
  }, [isDeletingEdge, name, route, selectedEdge]);

  const syncSelectedEdgeWithGraph = useCallback((graphData: GraphData | null) => {
    if (!selectedEdge || !graphData) return;
    const selectedKey = getEdgeKey(selectedEdge.sourceId, selectedEdge.targetId);
    const stillExists = graphData.links.some((graphLink) => {
      const sourceId = getLinkNodeId(graphLink.source);
      const targetId = getLinkNodeId(graphLink.target);
      return getEdgeKey(sourceId, targetId) === selectedKey;
    });

    if (!stillExists) {
      setSelectedEdge(null);
    }
  }, [selectedEdge]);

  return {
    selectedEdge,
    setSelectedEdge,
    isDeletingEdge,
    closeDeleteConnectionModal,
    clearSelectedEdge,
    handleDeleteConnection,
    syncSelectedEdgeWithGraph,
  };
}
