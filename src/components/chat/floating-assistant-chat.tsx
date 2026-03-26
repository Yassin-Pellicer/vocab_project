import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDownRight, GripVertical, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chat, type ChatHandle } from "./index";
import type { ContextType } from "@/types/chat";
import type { TranslationEntry } from "@/types/translation-entry";

type FloatingAssistantChatProps = {
  route: string;
  name: string;
  context?: ContextType;
  startingInfo?: TranslationEntry | string | null;
  /** localStorage key for position + size (stable per screen; do not include word/note id) */
  layoutStorageKey: string;
  className?: string;
};

const FAB_OFFSET = 24;
const DEFAULT_WIDTH = 416;
const DEFAULT_HEIGHT = 560;
const MIN_W = 280;
const MIN_H = 320;
const MARGIN = 8;

type StoredLayout = { x?: number; y?: number; width?: number; height?: number };

function readStoredLayout(key: string): StoredLayout | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLayout;
  } catch {
    return null;
  }
}

export function FloatingAssistantChat({
  route,
  name,
  context,
  startingInfo,
  layoutStorageKey,
  className,
}: FloatingAssistantChatProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const panelRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<ChatHandle>(null);
  const posRef = useRef(pos);
  const sizeRef = useRef(size);
  posRef.current = pos;
  sizeRef.current = size;

  const clampLayout = useCallback((x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = Math.min(Math.max(MIN_W, w), vw - 2 * MARGIN);
    const ch = Math.min(Math.max(MIN_H, h), vh - 2 * MARGIN);
    return {
      x: Math.min(Math.max(MARGIN, x), Math.max(MARGIN, vw - cw - MARGIN)),
      y: Math.min(Math.max(60 + 8, y), Math.max(MARGIN, vh - ch - MARGIN)),
      width: cw,
      height: ch,
    };
  }, []);

  const persistLayout = useCallback(
    (layout: { x: number; y: number; width: number; height: number }) => {
      const next = clampLayout(layout.x, layout.y, layout.width, layout.height);
      localStorage.setItem(
        layoutStorageKey,
        JSON.stringify({ x: next.x, y: next.y, width: next.width, height: next.height })
      );
      return next;
    },
    [clampLayout, layoutStorageKey]
  );

  useLayoutEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const stored = readStoredLayout(layoutStorageKey);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = stored?.width ?? DEFAULT_WIDTH;
      const h = stored?.height ?? DEFAULT_HEIGHT;
      if (stored && typeof stored.x === "number" && typeof stored.y === "number") {
        const next = clampLayout(stored.x, stored.y, w, h);
        setPos({ x: next.x, y: next.y });
        setSize({ width: next.width, height: next.height });
        return;
      }
      const next = clampLayout(vw - w - FAB_OFFSET, vh - h - FAB_OFFSET, w, h);
      setPos({ x: next.x, y: next.y });
      setSize({ width: next.width, height: next.height });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, clampLayout, layoutStorageKey]);

  useEffect(() => {
    if (!open) return;
    const onWinResize = () => {
      const p = posRef.current;
      const s = sizeRef.current;
      const next = clampLayout(p.x, p.y, s.width, s.height);
      setPos({ x: next.x, y: next.y });
      setSize({ width: next.width, height: next.height });
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [open, clampLayout]);

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = pos.x;
      const origY = pos.y;
      const w = size.width;
      const h = size.height;

      const onMove = (ev: PointerEvent) => {
        const nx = origX + (ev.clientX - startX);
        const ny = origY + (ev.clientY - startY);
        const next = clampLayout(nx, ny, w, h);
        setPos({ x: next.x, y: next.y });
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        const nx = origX + (ev.clientX - startX);
        const ny = origY + (ev.clientY - startY);
        const next = persistLayout({ x: nx, y: ny, width: w, height: h });
        setPos({ x: next.x, y: next.y });
        setSize({ width: next.width, height: next.height });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [clampLayout, persistLayout, pos.x, pos.y, size.width, size.height]
  );

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const origW = size.width;
      const origH = size.height;
      const origX = pos.x;
      const origY = pos.y;

      const onMove = (ev: PointerEvent) => {
        const dw = ev.clientX - startX;
        const dh = ev.clientY - startY;
        const next = clampLayout(origX, origY, origW + dw, origH + dh);
        setPos({ x: next.x, y: next.y });
        setSize({ width: next.width, height: next.height });
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        const dw = ev.clientX - startX;
        const dh = ev.clientY - startY;
        const next = persistLayout({
          x: origX,
          y: origY,
          width: origW + dw,
          height: origH + dh,
        });
        setPos({ x: next.x, y: next.y });
        setSize({ width: next.width, height: next.height });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [clampLayout, persistLayout, pos.x, pos.y, size.width, size.height]
  );

  return (
    <div className={cn("pointer-events-none", className)}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto fixed z-50 flex size-14 items-center justify-center rounded-full border border-primary/25 bg-linear-to-br from-primary/15 via-background to-background text-primary shadow-lg shadow-primary/15 ring-2 ring-primary/10 transition-all hover:scale-105 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 active:scale-100"
          style={{ right: FAB_OFFSET, bottom: FAB_OFFSET }}
          aria-label="Open assistant"
          title="Assistant"
        >
          <Sparkles className="size-6 drop-shadow-sm" strokeWidth={2} />
        </button>
      ) : (
        <div
          ref={panelRef}
          className="pointer-events-auto fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-background shadow-sm"
          style={{
            left: pos.x,
            top: pos.y,
            width: size.width,
            height: size.height,
            maxWidth: `calc(100vw - ${2 * MARGIN}px)`,
            maxHeight: `calc(100vh - ${2 * MARGIN}px)`,
          }}
        >
          <div
            role="toolbar"
            aria-label="Assistant panel"
            onPointerDown={onHeaderPointerDown}
            className="flex shrink-0 cursor-grab items-center justify-between gap-4 border-b border-primary/10 px-3 py-2.5 active:cursor-grabbing"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4 text-sm font-semibold text-foreground">
              <GripVertical className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <Sparkles className="size-4 shrink-0" />
              <span className="truncate">Assistant</span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear chat"
                title="Clear chat"
                onClick={() => chatRef.current?.clearChat()}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close assistant"
                title="Close"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-2">
            <Chat
              ref={chatRef}
              hideToolbar
              route={route}
              name={name}
              context={context}
              startingInfo={startingInfo}
            />
          </div>
          <div
            role="separator"
            aria-label="Resize assistant panel"
            title="Drag to resize"
            onPointerDown={onResizePointerDown}
            className="flex flex-end pointer-events-auto absolute bottom-0 right-0 z-10 h-5 w-5 cursor-se-resize touch-none rounded-br-2xl"
          >
                      <ArrowDownRight size={16}></ArrowDownRight>
            </div>
        </div>
      )}
    </div>
  );
}
