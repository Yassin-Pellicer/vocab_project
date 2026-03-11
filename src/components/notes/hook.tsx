import { useConfigStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useRef, useState } from "react";

export default function Hooks({
}: {
  route: string;
  name: string;
}) {
  const {
    searchField,
    setSearchField,
  } = useConfigStore();
  
  const { setSelectedNoteId, getRoute } = useNotesStore();
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string | null>(null);
  const [selectedNoteRoute, setSelectedNoteRoute] = useState<string | null>(null);

  const handleMenuItemClick = (item: SidebarNode) => {
    setSelectedNoteId(item.id);
    setSelectedNoteTitle(item.title);
    setSelectedNoteRoute(getRoute(item.id));
  }

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
