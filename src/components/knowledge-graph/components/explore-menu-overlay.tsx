import type { GraphNode } from "@/types/graph-types";
import type { GraphMenuState } from "../types";

type ExploreMenuOverlayProps = {
  show: boolean;
  menuState: GraphMenuState;
  onSelectNode: (node: GraphNode) => void;
};

export function ExploreMenuOverlay({
  show,
  menuState,
  onSelectNode,
}: ExploreMenuOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="w-[min(92%,520px)] rounded-2xl border border-border bg-card p-4 shadow-lg">
        <div className="text-sm font-semibold text-foreground">
          Explore connections
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Select a word to center the graph.
        </div>
        {menuState.menuItems.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            {menuState.menuQuery
              ? "No matching words found."
              : "No related words found yet."}
          </div>
        ) : (
          <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border/60 bg-background">
            {menuState.menuItems.map(({ node, neighbors }) => {
              const previewNeighbors = neighbors.slice(0, 8);
              const previewCount = previewNeighbors.length;
              const previewRadius = 22;
              return (
                <button
                  key={`graph-menu-${node.id}`}
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/40"
                  onClick={() => onSelectNode(node)}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width={60}
                      height={60}
                      viewBox="0 0 60 60"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <circle cx={30} cy={30} r={6} fill="currentColor" opacity={0.7} />
                      {previewNeighbors.map((_, index) => {
                        const angle = (index / Math.max(1, previewCount)) * Math.PI * 2;
                        const x = 30 + Math.cos(angle) * previewRadius;
                        const y = 30 + Math.sin(angle) * previewRadius;
                        return (
                          <circle
                            key={`${node.id}-preview-${index}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill="currentColor"
                            opacity={0.35}
                          />
                        );
                      })}
                    </svg>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {node.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {neighbors.length} connections
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
