import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

export default function hook(dictRoute: string, dictName: string, item?: SidebarNode | null) {
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
  }, [item])

  const selectRoute = (n: any) => {
    console.log("Selected route:", n);
    setRoute(n.title);
    setSelectedNode(n);
  }

  const handleSubmit = async () => {
    await (window.api).createDictionary(route, name);
    setRoute("");
    setName("");
  };

  const handleAddNote = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();

    if (!selectedNode) {
      appendChild({ id, title: name }, null);
    } else {
      appendChild({ id, title: name }, selectedNode.id);
    }

    await window.api.saveNoteIndex(
      dictRoute,
      dictName,
      useNotesStore.getState().tree
    );

    await window.api.saveNotes(dictRoute, dictName, id, undefined);

    setName("");
    setSelectedNode(null);
  };
  return {
    disableSetRouteInput,
    setDisableSetRouteInput,
    handleSubmit,
    route,
    setRoute,
    name,
    setName,
    selectRoute,
    handleAddNote
  };
}