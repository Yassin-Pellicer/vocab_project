import { DictionaryContext } from "@/context/dictionary-context";
import { NotesContext } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useResizablePanel } from "@/hooks/use-resizable-panel";

export default function useNotesHooks() {
  const {
    notesSearchField: searchField,
    setNotesSearchField: setSearchField,
  } = DictionaryContext();

  const { tree, findById, selectedNoteId, setSelectedNoteId, getRoute } = NotesContext();

  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string | null>(null);
  const [selectedNoteRoute, setSelectedNoteRoute] = useState<string | null>(null);

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
  const containerRef = useRef<HTMLDivElement>(null);

  const getContainerWidth = useCallback(() => {
    return containerRef.current?.getBoundingClientRect().width ?? window.innerWidth;
  }, []);

  const getMaxSidebarWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    const minCenterWidth = 360;
    return Math.max(0, Math.floor(containerWidth - minCenterWidth));
  }, [getContainerWidth]);

  const {
    width: sidebarWidth,
    collapsed: sidebarCollapsed,
    handleResizeStart,
  } = useResizablePanel({
    storageKey: "notes-sidebar",
    defaultWidth: 392,
    defaultCollapsed: false,
    minWidth: 260,
    maxWidth: () => Math.min(720, getMaxSidebarWidth()),
    direction: "left",
    containerRef,
    collapseBelowMin: false,
    ignoreStoredCollapsed: true,
    forceVisibleOnInit: true,
  });

  return {
    searchField,
    setSearchField,
    searchRef,
    containerRef,
    handleMenuItemClick,
    selectedNoteTitle,
    selectedNoteRoute,
    sidebarWidth,
    sidebarCollapsed,
    handleResizeStart,
  };
}
