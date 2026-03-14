import { useNotesStore } from "@/context/notes-context";
import { notify } from "@/services/notify";
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

    const fromTitle = item?.title ?? "";
    const fromPath = item ? useNotesStore.getState().getRoute(item.id) : null;
    const beforeParent = item ? selectParent(item) : undefined;
    const beforeParentId =
      beforeParent && item && beforeParent.id !== item.id ? beforeParent.id : null;

    const toTitle = name.trim();
    moveNode(item!.id, selectedNode?.id ?? null);
    renameNode(item!.id, toTitle);
    await window.api.saveNoteIndex(dictRoute, dictName, useNotesStore.getState().tree);

    const toPath = item ? useNotesStore.getState().getRoute(item.id) : null;
    const afterParent = item ? selectParent(item) : undefined;
    const afterParentId =
      afterParent && item && afterParent.id !== item.id ? afterParent.id : null;

    const renamed = fromTitle !== toTitle;
    const moved = beforeParentId !== afterParentId;
    if (renamed || moved) {
      notify("noteUpdated", {
        dictionary: dictName,
        renamed,
        moved,
        fromPath,
        toPath,
        fromTitle,
        toTitle,
      });
    }

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
