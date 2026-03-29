import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";
import { getEntryLabel } from "../utils";

type LinkWordModalProps = {
  sourceNode: GraphNode | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  linkableEntries: TranslationEntry[];
  isSaving: boolean;
  onLinkWord: (entry: TranslationEntry) => void;
  onClose: () => void;
};

export function LinkWordModal({
  sourceNode,
  searchValue,
  onSearchChange,
  linkableEntries,
  isSaving,
  onLinkWord,
  onClose,
}: LinkWordModalProps) {
  const sourceWord = sourceNode?.wordData;
  if (!sourceWord) return null;

  const sourceLabel = getEntryLabel(sourceWord);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="text-base font-semibold text-card-foreground">
          Link Word
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Link <span className="font-medium text-foreground">{sourceLabel}</span> to another word.
        </div>

        <input
          autoFocus
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search word or translation..."
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
        />

        <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border/70 bg-background/50">
          {linkableEntries.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              {searchValue.trim()
                ? "No matching words available to link."
                : "No available words to link."}
            </div>
          ) : (
            linkableEntries.slice(0, 100).map((entry) => {
              const primary = getEntryLabel(entry);
              const translations = entry.pair[0]?.translations
                ?.map((translation) => translation.word)
                .filter(Boolean)
                .slice(0, 3)
                .join(", ");

              return (
                <button
                  key={`linkable-${entry.uuid}`}
                  type="button"
                  disabled={isSaving}
                  onClick={() => onLinkWord(entry)}
                  className="w-full border-b border-border/60 px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 last:border-b-0"
                >
                  <div className="font-medium">{primary}</div>
                  {translations && (
                    <div className="text-xs text-muted-foreground">{translations}</div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/40 disabled:opacity-60"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
