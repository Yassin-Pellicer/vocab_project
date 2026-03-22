import { NotesContext } from "@/context/notes-context";
import { notify } from "@/services/notify";
import { SidebarNode } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export default function useEditNoteModalHooks(
  dictRoute: string,
  dictName: string,
  item: SidebarNode | null,
) {
  const [route, setRoute] = useState("Root");
  const [name, setName] = useState(item?.title || "");
  const { selectParent, moveNode, isDescendantOrSelf, renameNode } = NotesContext();
  const [selectedNode, setSelectedNode] = useState<SidebarNode | null>(null);

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
    if (!item) {
      setRoute("Root");
      setSelectedNode(null);
      setName("");
      return;
    }
    setName(item.title);
    const parentNode = selectParent(item);
    setSelectedNode(parentNode && parentNode.id !== item.id ? parentNode : null);
    setRoute(parentNode ? parentNode.title : "Root");
  }, [item, selectParent]);

  const handleAddNote = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!item) return;
    if (!name.trim()) return;

    const fromTitle = item?.title ?? "";
    const fromPath = item ? NotesContext.getState().getRoute(item.id) : null;
    const beforeParent = item ? selectParent(item) : undefined;
    const beforeParentId =
      beforeParent && item && beforeParent.id !== item.id ? beforeParent.id : null;

    const toTitle = name.trim();
    moveNode(item.id, selectedNode?.id ?? null);
    renameNode(item.id, toTitle);
    await window.api.saveNoteIndex(dictRoute, dictName, NotesContext.getState().tree);

    const toPath = item ? NotesContext.getState().getRoute(item.id) : null;
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
    selectedNode,
    setSelectedNode,
    route,
    setRoute,
    name,
    setName,
    selectRoute,
    handleAddNote,
  };
}
