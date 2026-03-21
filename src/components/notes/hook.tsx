import { useConfigStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("notes-sidebar");
      if (!raw) return 392;
      const parsedJson = JSON.parse(raw);
      const parsed = Number(parsedJson?.width);
      return Number.isFinite(parsed) ? parsed : 392;
    } catch {
      return 392;
    }
  });

  const [chatCollapsed, setChatCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("chat-sidebar");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.collapsed);
    } catch {
      return false;
    }
  });

  const [chatWidth, setChatWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("chat-sidebar");
      if (!raw) return 392;
      const parsedJson = JSON.parse(raw);
      const parsed = Number(parsedJson?.width);
      return Number.isFinite(parsed) ? parsed : 392;
    } catch {
      return 392;
    }
  });

  const sidebarWidthRef = useRef(sidebarWidth);
  const sidebarCollapsedRef = useRef(sidebarCollapsed);
  const chatWidthRef = useRef(chatWidth);
  const chatCollapsedRef = useRef(chatCollapsed);
  useEffect(() => { sidebarWidthRef.current = sidebarWidth; }, [sidebarWidth]);
  useEffect(() => { sidebarCollapsedRef.current = sidebarCollapsed; }, [sidebarCollapsed]);
  useEffect(() => { chatWidthRef.current = chatWidth; }, [chatWidth]);
  useEffect(() => { chatCollapsedRef.current = chatCollapsed; }, [chatCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "notes-sidebar",
        JSON.stringify({ width: sidebarWidth, collapsed: sidebarCollapsed }),
      );
      localStorage.setItem(
        "chat-sidebar",
        JSON.stringify({ width: chatWidth, collapsed: chatCollapsed }),
      );
    } catch {
    }
  }, [sidebarWidth, sidebarCollapsed, chatWidth, chatCollapsed]);

  const getContainerWidth = useCallback(() => {
    return (
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth
    );
  }, []);

  const getMaxSidebarWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    const minCenterWidth = 360;
    const otherWidth = chatCollapsed ? 0 : chatWidth;
    return Math.max(0, Math.floor(containerWidth - otherWidth - minCenterWidth));
  }, [chatCollapsed, chatWidth, getContainerWidth]);

  const getMaxChatWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    const minCenterWidth = 360;
    const otherWidth = sidebarCollapsed ? 0 : sidebarWidth;
    return Math.max(0, Math.floor(containerWidth - otherWidth - minCenterWidth));
  }, [sidebarCollapsed, sidebarWidth, getContainerWidth]);

  useEffect(() => {
    const minWidth = 220;
    const maxWidth = getMaxSidebarWidth();
    setSidebarCollapsed(false);
    if (maxWidth <= 0) return;
    const next = Math.min(maxWidth, Math.max(minWidth, sidebarWidthRef.current));
    setSidebarWidth(next);
  }, [getMaxSidebarWidth]);

  useEffect(() => {
    const handleResize = () => {
      const minWidth = 260;
      const maxSidebarWidth = Math.min(720, getMaxSidebarWidth());
      if (!sidebarCollapsedRef.current) {
        if (maxSidebarWidth < minWidth) {
          setSidebarCollapsed(true);
        } else if (sidebarWidthRef.current > maxSidebarWidth) {
          setSidebarWidth(maxSidebarWidth);
        }
      }

      const maxChatWidth = getMaxChatWidth();
      if (!chatCollapsedRef.current) {
        if (maxChatWidth < minWidth) {
          setChatCollapsed(true);
        } else if (chatWidthRef.current > maxChatWidth) {
          setChatWidth(maxChatWidth);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getMaxSidebarWidth, getMaxChatWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      const minWidth = 220;
      const maxWidth = Math.min(720, getMaxSidebarWidth());
      if (maxWidth <= 0) return;
      const next = Math.min(maxWidth, Math.max(minWidth, sidebarWidthRef.current));
      if (next !== sidebarWidthRef.current) {
        setSidebarWidth(next);
      }
      setSidebarCollapsed(false);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [getMaxSidebarWidth]);

  const handleResizeStart = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = sidebarCollapsed ? 0 : sidebarWidth;

      const minWidth = 260;

      const onMove = (ev: PointerEvent) => {
        const rawNext = startWidth + (ev.clientX - startX);
        const maxWidth = Math.min(720, getMaxSidebarWidth());

        if (maxWidth < minWidth) {
          setSidebarCollapsed(true);
          return;
        }

        if (rawNext < minWidth) {
          setSidebarCollapsed(true);
          return;
        }

        setSidebarCollapsed(false);
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, rawNext)));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [sidebarWidth, sidebarCollapsed, getMaxSidebarWidth],
  );

  const handleResizeChat = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = chatCollapsed ? 0 : chatWidth;

      const minWidth = 260;

      const onMove = (ev: PointerEvent) => {
        const rawNext = startWidth + (startX - ev.clientX);
        const maxWidth = getMaxChatWidth();
        if (maxWidth < minWidth) {
          setChatCollapsed(true);
          return;
        }
        if (rawNext < minWidth) {
          setChatCollapsed(true);
          return;
        }

        setChatCollapsed(false);
        setChatWidth(Math.min(maxWidth, Math.max(minWidth, rawNext)));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [chatWidth, chatCollapsed, getMaxChatWidth],
  );

  const expandChat = useCallback(() => {
    const minWidth = 260;
    const maxWidth = getMaxChatWidth();
    if (maxWidth < minWidth) {
      setChatCollapsed(true);
      return;
    }
    setChatCollapsed(false);
    setChatWidth(Math.max(minWidth, Math.min(500, maxWidth)));
  }, [getMaxChatWidth]);

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
