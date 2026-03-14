import { useNotesStore } from "@/context/notes-context";
import { notify } from "@/services/notify";
import { SidebarNode } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export default function useAddNoteModalHooks(
  dictRoute: string,
  dictName: string,
  item?: SidebarNode | null,
) {
  const [route, setRoute] = useState(item?.title || "");
  const [name, setName] = useState("");
  const [disableSetRouteInput, setDisableSetRouteInput] = useState(!!item || item === null);
  const { appendChild } = useNotesStore();
  const [selectedNode, setSelectedNode] = useState<SidebarNode | null>(item || null);

  useEffect(() => {
    if (item == null) {
      setRoute("Root");
      setSelectedNode(null);
      return;
    }
  }, [item]);

  const selectRoute = (n: SidebarNode | null) => {
    if (!n) {
      setRoute("Root");
      setSelectedNode(null);
      return;
    }
    setRoute(n.title);
    setSelectedNode(n);
  };

  const handleAddNote = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const title = name.trim();
    const id = crypto.randomUUID();

    if (!selectedNode) {
      appendChild({ id, title }, null);
    } else {
      appendChild({ id, title }, selectedNode.id);
    }

    await window.api.saveNoteIndex(
      dictRoute,
      dictName,
      useNotesStore.getState().tree
    );

    await window.api.saveNotes(dictRoute, dictName, id, undefined);
    notify("noteCreated", { title, dictionary: dictName });

    setName("");
    setSelectedNode(null);
  };
  return {
    disableSetRouteInput,
    setDisableSetRouteInput,
    route,
    setRoute,
    name,
    setName,
    selectRoute,
    handleAddNote
  };
}
