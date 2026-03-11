import { useConfigStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useEffect, useRef, useState } from "react";

export default function Hooks({}: { route: string; name: string }) {
  const { searchField, setSearchField } = useConfigStore();

  const {
    tree,
    findById,
    selectedNoteId,
    setSelectedNoteId,
    getRoute,
  } = useNotesStore();
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string | null>(
    null,
  );
  const [selectedNoteRoute, setSelectedNoteRoute] = useState<string | null>(
    null,
  );

  const handleMenuItemClick = (item: SidebarNode) => {
    setSelectedNoteId(item.id);
    setSelectedNoteTitle(item.title);
    setSelectedNoteRoute(getRoute(item.id));
  };

  useEffect(() => {
    if (!selectedNoteId) {
      setSelectedNoteTitle(null);
      setSelectedNoteRoute(null);
      return;
    }

    const node = findById(selectedNoteId);
    setSelectedNoteTitle(node ? node.title : null);
    setSelectedNoteRoute(node ? getRoute(node.id) : null);
  }, [selectedNoteId, tree, findById, getRoute]);

  const searchRef = useRef<HTMLInputElement>(null);

  return {
    searchField,
    setSearchField,
    searchRef,
    handleMenuItemClick,
    selectedNoteTitle,
    selectedNoteRoute,
  };
}
