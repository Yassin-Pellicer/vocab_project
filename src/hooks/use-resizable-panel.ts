import { useCallback, useEffect, useRef, useState } from "react";

type ResizeDirection = "left" | "right";

type ResizablePanelOptions = {
  storageKey: string;
  defaultWidth: number;
  defaultCollapsed?: boolean;
  minWidth: number;
  maxWidth: () => number;
  direction?: ResizeDirection;
  containerRef?: React.RefObject<HTMLElement | null>;
  collapseBelowMin?: boolean;
  ignoreStoredCollapsed?: boolean;
  forceVisibleOnInit?: boolean;
  getInitialWidth?: () => number | null;
};

type ResizablePanelState = {
  width: number;
  collapsed: boolean;
  setWidth: (next: number) => void;
  setCollapsed: (next: boolean) => void;
  handleResizeStart: (e: React.PointerEvent) => void;
  widthRef: React.MutableRefObject<number>;
  collapsedRef: React.MutableRefObject<boolean>;
};

export function useResizablePanel(options: ResizablePanelOptions): ResizablePanelState {
  const {
    storageKey,
    defaultWidth,
    defaultCollapsed = false,
    minWidth,
    maxWidth,
    direction = "left",
    containerRef,
    collapseBelowMin = true,
    ignoreStoredCollapsed = false,
    forceVisibleOnInit = false,
    getInitialWidth,
  } = options;

  const initRef = useRef<{
    width: number;
    collapsed: boolean;
    hasStored: boolean;
  } | null>(null);

  if (!initRef.current) {
    let width = defaultWidth;
    let collapsed = defaultCollapsed;
    let hasStored = false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        hasStored = true;
        const parsed = JSON.parse(raw);
        const parsedWidth = Number(parsed?.width);
        width = Number.isFinite(parsedWidth) ? parsedWidth : defaultWidth;
        collapsed = Boolean(parsed?.collapsed);
      }
    } catch {
      // ignore
    }
    if (ignoreStoredCollapsed) {
      collapsed = defaultCollapsed;
    }
    initRef.current = { width, collapsed, hasStored };
  }

  const [width, setWidth] = useState(initRef.current.width);
  const [collapsed, setCollapsed] = useState(initRef.current.collapsed);
  const hasStoredRef = useRef(initRef.current.hasStored);
  const didApplyInitialRef = useRef(false);
  const didUserResizeRef = useRef(false);

  const widthRef = useRef(width);
  const collapsedRef = useRef(collapsed);
  useEffect(() => { widthRef.current = width; }, [width]);
  useEffect(() => { collapsedRef.current = collapsed; }, [collapsed]);

  const clampWidth = useCallback((value: number) => {
    const max = maxWidth();
    if (max <= 0) return 0;
    const min = Math.min(minWidth, max);
    return Math.min(max, Math.max(min, value));
  }, [maxWidth, minWidth]);

  const applyClamp = useCallback(() => {
    const max = maxWidth();
    if (max <= 0) return;
    if (collapseBelowMin && max < minWidth) {
      setCollapsed(true);
      return;
    }
    const next = clampWidth(widthRef.current);
    if (next > 0 && next !== widthRef.current) {
      setWidth(next);
    }
    if (!collapseBelowMin) {
      setCollapsed(false);
    }
  }, [clampWidth, collapseBelowMin, maxWidth, minWidth]);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    didUserResizeRef.current = true;

    const startX = e.clientX;
    const startWidth = collapsedRef.current ? 0 : widthRef.current;

    const onMove = (ev: PointerEvent) => {
      const delta =
        direction === "left"
          ? ev.clientX - startX
          : startX - ev.clientX;
      const rawNext = startWidth + delta;
      const max = maxWidth();
      if (collapseBelowMin && max < minWidth) {
        setCollapsed(true);
        return;
      }
      if (collapseBelowMin && rawNext < minWidth) {
        setCollapsed(true);
        return;
      }
      setCollapsed(false);
      setWidth(clampWidth(rawNext));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [clampWidth, collapseBelowMin, direction, maxWidth, minWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ width, collapsed }),
      );
    } catch {
      // ignore
    }
  }, [collapsed, storageKey, width]);

  useEffect(() => {
    const handleResize = () => {
      applyClamp();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyClamp]);

  useEffect(() => {
    if (!containerRef?.current) return;
    const observer = new ResizeObserver(() => {
      applyClamp();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [applyClamp, containerRef]);

  useEffect(() => {
    if (!getInitialWidth) return;
    if (hasStoredRef.current || didApplyInitialRef.current || didUserResizeRef.current) return;
    const next = getInitialWidth();
    if (typeof next !== "number" || !Number.isFinite(next)) return;
    setWidth(clampWidth(next));
    didApplyInitialRef.current = true;
  }, [clampWidth, getInitialWidth]);

  useEffect(() => {
    if (!forceVisibleOnInit) return;
    setCollapsed(false);
    applyClamp();
  }, [applyClamp, forceVisibleOnInit]);

  return {
    width,
    collapsed,
    setWidth,
    setCollapsed,
    handleResizeStart,
    widthRef,
    collapsedRef,
  };
}
