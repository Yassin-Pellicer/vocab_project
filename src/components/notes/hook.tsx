import { useConfigStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useResizablePanel } from "@/hooks/use-resizable-panel";

export default function useNotesHooks() {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarStateRef = useRef({ width: 392, collapsed: false });
  const chatStateRef = useRef({ width: 392, collapsed: false });

  const getContainerWidth = useCallback(() => {
    return (
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth
    );
  }, []);

  const getMaxSidebarWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    const minCenterWidth = 360;
    const otherWidth = chatStateRef.current.collapsed ? 0 : chatStateRef.current.width;
    return Math.max(0, Math.floor(containerWidth - otherWidth - minCenterWidth));
  }, [getContainerWidth]);

  const getMaxChatWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    const minCenterWidth = 360;
    const otherWidth = sidebarStateRef.current.collapsed ? 0 : sidebarStateRef.current.width;
    return Math.max(0, Math.floor(containerWidth - otherWidth - minCenterWidth));
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

  const {
    width: chatWidth,
    collapsed: chatCollapsed,
    handleResizeStart: handleResizeChat,
    setCollapsed: setChatCollapsed,
    setWidth: setChatWidth,
  } = useResizablePanel({
    storageKey: "chat-sidebar",
    defaultWidth: 392,
    defaultCollapsed: false,
    minWidth: 260,
    maxWidth: getMaxChatWidth,
    direction: "right",
    containerRef,
    collapseBelowMin: true,
  });

  useEffect(() => {
    sidebarStateRef.current = { width: sidebarWidth, collapsed: sidebarCollapsed };
  }, [sidebarWidth, sidebarCollapsed]);

  useEffect(() => {
    chatStateRef.current = { width: chatWidth, collapsed: chatCollapsed };
  }, [chatWidth, chatCollapsed]);

  const expandChat = useCallback(() => {
    const minWidth = 260;
    const maxWidth = getMaxChatWidth();
    if (maxWidth < minWidth) {
      setChatCollapsed(true);
      return;
    }
    setChatCollapsed(false);
    setChatWidth(Math.max(minWidth, Math.min(500, maxWidth)));
  }, [getMaxChatWidth, setChatCollapsed, setChatWidth]);

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
    chatWidth,
    chatCollapsed,
    handleResizeChat,
    setChatCollapsed,
    setChatWidth,
    expandChat,
  };
}
