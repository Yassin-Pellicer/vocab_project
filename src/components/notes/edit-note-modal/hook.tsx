import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export default function hook(dictRoute: string, dictName: string, item: SidebarNode | null) {
  const [route, setRoute] = useState(item?.title || "");
  const [name, setName] = useState(item?.title || "");
  const [disableSetRouteInput, setDisableSetRouteInput] = useState(!!item || item === null);
  const { selectParent, moveNode, isDescendantOrSelf, renameNode } = useNotesStore();
  const [selectedNode, setSelectedNode] = useState<SidebarNode | null>(item || null);

  const selectRoute = (n: SidebarNode | null) => {
    if (n === null) {
      setRoute("Root");
      setSelectedNode(null);
      return;
    }
    if (item && isDescendantOrSelf(item.id, n.id)) {
      console.warn("Cannot move a node into itself or its children");
      return;
    }
    setRoute(n.title);
    setSelectedNode(n);
  };
  
  useEffect(() => {
    if (item === undefined) return;
    const parentNode = selectParent(item!) ?? null;
    setSelectedNode(parentNode);
    setRoute(parentNode ? parentNode.title : item!.title);
    setDisableSetRouteInput(!!parentNode || item === null);
  }, [item]);

  const handleSubmit = async () => {
    await window.api.createDictionary(route, name);
    setRoute("");
    setName("");
  };

  const handleAddNote = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    moveNode(item!.id, selectedNode?.id ?? null);
    renameNode(item!.id, name);
    await window.api.saveNoteIndex(dictRoute, dictName, useNotesStore.getState().tree);
    setName("");
    setSelectedNode(null);
  };

  return {
    disableSetRouteInput,
    selectedNode,
    setSelectedNode,
    setDisableSetRouteInput,
    handleSubmit,
    route,
    setRoute,
    name,
    setName,
    selectRoute,
    handleAddNote,
  };
}