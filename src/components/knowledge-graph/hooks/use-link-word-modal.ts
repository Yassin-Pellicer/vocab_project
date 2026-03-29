import { useCallback, useState } from "react";
import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";

type UseLinkWordModalParams = {
  route: string;
  name: string;
  onOpen?: () => void;
};

export function useLinkWordModal({ route, name, onOpen }: UseLinkWordModalParams) {
  const [linkSourceNode, setLinkSourceNode] = useState<GraphNode | null>(null);
  const [linkSearchValue, setLinkSearchValue] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  const openLinkModal = useCallback((node: GraphNode) => {
    if (!node.wordData?.uuid) return;
    onOpen?.();
    setLinkSearchValue("");
    setLinkSourceNode(node);
  }, [onOpen]);

  const closeLinkModal = useCallback(() => {
    if (isSavingLink) return;
    setLinkSourceNode(null);
    setLinkSearchValue("");
  }, [isSavingLink]);

  const clearLinkModal = useCallback(() => {
    setLinkSourceNode(null);
    setLinkSearchValue("");
  }, []);

  const handleLinkWord = useCallback(async (entry: TranslationEntry) => {
    const sourceId = linkSourceNode?.wordData?.uuid;
    const destinationId = entry.uuid;
    if (!sourceId || !destinationId || sourceId === destinationId || isSavingLink) {
      return;
    }

    setIsSavingLink(true);
    try {
      await window.api.saveGraph(
        route,
        name,
        { uuid: sourceId },
        { uuid: destinationId },
      );
      clearLinkModal();
    } catch (error) {
      console.error("Failed to link words from graph context menu:", error);
    } finally {
      setIsSavingLink(false);
    }
  }, [clearLinkModal, isSavingLink, linkSourceNode?.wordData?.uuid, name, route]);

  return {
    linkSourceNode,
    linkSearchValue,
    setLinkSearchValue,
    isSavingLink,
    openLinkModal,
    closeLinkModal,
    clearLinkModal,
    handleLinkWord,
  };
}
