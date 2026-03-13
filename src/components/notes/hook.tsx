import { useConfigStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("notes-sidebar");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.collapsed);
    } catch {
      return false;
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(
        "notes-sidebar",
        JSON.stringify({ width: sidebarWidth, collapsed: sidebarCollapsed }),
      );
    } catch {
    }
  }, [sidebarWidth, sidebarCollapsed]);

  const handleResizeStart = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = sidebarCollapsed ? 0 : sidebarWidth;

      const minWidth = 260;
      const maxWidth = 720;

      const onMove = (ev: PointerEvent) => {
        const rawNext = startWidth + (ev.clientX - startX);

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
    [sidebarWidth, sidebarCollapsed],
  );

  return {
    searchField,
    setSearchField,
    searchRef,
    handleMenuItemClick,
    selectedNoteTitle,
    selectedNoteRoute,
    sidebarWidth,
    sidebarCollapsed,
    handleResizeStart,
  };
}
