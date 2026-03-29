import type { EdgeSelection } from "../types";

type DeleteConnectionModalProps = {
  selectedEdge: EdgeSelection | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
};

export function DeleteConnectionModal({
  selectedEdge,
  isDeleting,
  onClose,
  onConfirmDelete,
}: DeleteConnectionModalProps) {
  if (!selectedEdge) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="text-base font-semibold text-card-foreground">
          Delete Connection
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Remove the connection between{" "}
          <span className="font-medium text-foreground">{selectedEdge.sourceLabel}</span>
          {" "}and{" "}
          <span className="font-medium text-foreground">{selectedEdge.targetLabel}</span>?
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/40 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="rounded-lg border border-red-600/40 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
