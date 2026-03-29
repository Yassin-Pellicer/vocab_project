import { Link } from "lucide-react";
import type { ContextMenuState } from "../types";

type NodeContextMenuProps = {
  contextMenu: ContextMenuState | null;
  onLinkWord: (contextMenu: ContextMenuState) => void;
  onSelectWord: (contextMenu: ContextMenuState) => void;
};

export function NodeContextMenu({
  contextMenu,
  onLinkWord,
  onSelectWord,
}: NodeContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      className="absolute z-20 w-56 rounded-xl border border-border bg-popover divide-y shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
        {contextMenu.node.label}
      </div>
      <button
        onClick={() => onLinkWord(contextMenu)}
        className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm hover:bg-muted/40"
      >
        <Link size={12} />
        Link word
      </button>
      <button
        onClick={() => onSelectWord(contextMenu)}
        className="w-full px-2 py-2 text-left text-sm hover:bg-muted/40"
      >
        Select word
      </button>
    </div>
  );
}
