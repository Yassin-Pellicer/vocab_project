import { useRef } from "react"
import { Sparkles, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Chat, type ChatHandle } from "./index"
import type { ContextType } from "@/types/chat"
import type { TranslationEntry } from "@/types/translation-entry"
import { useFloatingChatLayout } from "@/components/chat/hooks/use-floating-chat-layout"

type FloatingAssistantChatProps = {
  route: string;
  name: string;
  context?: ContextType;
  startingInfo?: TranslationEntry | string | null;
  /** localStorage key for position + size (stable per screen; do not include word/note id) */
  layoutStorageKey: string;
  className?: string;
}

const FAB_OFFSET = 24
const MARGIN = 8

export function FloatingAssistantChat({
  route,
  name,
  context,
  startingInfo,
  layoutStorageKey,
  className,
}: FloatingAssistantChatProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<ChatHandle>(null)
  const {
    open,
    pos,
    size,
    openAssistant,
    closeAssistant,
    onHeaderPointerDown,
    onResizePointerDown,
  } = useFloatingChatLayout(layoutStorageKey)

  return (
    <div className={cn("pointer-events-none", className)}>
      {!open ? (
        <button
          type="button"
          onClick={openAssistant}
          className="pointer-events-auto fixed z-50 flex size-14 items-center justify-center rounded-full border border-primary/30 bg-linear-to-br from-primary/20 via-background to-background text-primary shadow-xl shadow-primary/20 ring-2 ring-primary/10 transition-all hover:scale-105 hover:border-primary/45 hover:shadow-2xl hover:shadow-primary/25 active:scale-100"
          style={{ right: FAB_OFFSET, bottom: FAB_OFFSET }}
          aria-label="Open assistant"
          title="Assistant"
        >
          <Sparkles className="size-6 drop-shadow-sm" strokeWidth={2} />
        </button>
      ) : (
        <div
          ref={panelRef}
          className="pointer-events-auto fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur"
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
            className="flex shrink-0 cursor-grab items-center justify-between gap-4 border-b border-primary/10 bg-linear-to-r from-primary/10 via-background to-background px-3 py-2.5 active:cursor-grabbing"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4 text-sm font-semibold text-foreground">
              <Sparkles strokeWidth={1.1}  className="size-4 shrink-0" />
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
                onClick={closeAssistant}
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
            aria-label="Resize assistant panel (top)"
            title="Drag to resize"
            onPointerDown={(event) => onResizePointerDown(event, "top")}
            className="pointer-events-auto absolute left-2 right-2 top-0 z-20 h-2 cursor-ns-resize touch-none"
          />
          <div
            role="separator"
            aria-label="Resize assistant panel (right)"
            title="Drag to resize"
            onPointerDown={(event) => onResizePointerDown(event, "right")}
            className="pointer-events-auto absolute right-0 top-2 bottom-8 z-20 w-2 cursor-ew-resize touch-none"
          />
          <div
            role="separator"
            aria-label="Resize assistant panel (bottom)"
            title="Drag to resize"
            onPointerDown={(event) => onResizePointerDown(event, "bottom")}
            className="pointer-events-auto absolute left-2 right-8 bottom-0 z-20 h-2 cursor-ns-resize touch-none"
          />
          <div
            role="separator"
            aria-label="Resize assistant panel (left)"
            title="Drag to resize"
            onPointerDown={(event) => onResizePointerDown(event, "left")}
            className="pointer-events-auto absolute left-0 top-2 bottom-2 z-20 w-2 cursor-ew-resize touch-none"
          />
          <button
            type="button"
            aria-label="Close assistant"
            title="Close"
            onClick={closeAssistant}
            className="pointer-events-auto absolute bottom-4 right-4 z-30 flex size-6 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-md transition hover:text-foreground hover:shadow-lg"
          >
            <X className="size-4" />
          </button>
          <div
            role="separator"
            aria-label="Resize assistant panel"
            title="Drag to resize"
            onPointerDown={(event) => onResizePointerDown(event, "cornerTopLeft")}
            className="pointer-events-auto absolute left-0 top-0 z-20 h-8 w-8 cursor-nwse-resize touch-none rounded-tl-2xl"
          />
        </div>
      )}
    </div>
  )
}
