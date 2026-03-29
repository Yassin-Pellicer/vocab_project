import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";

export const ROOT_ID = "__ROOT__";
export const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

export const normalizeWord = (value: string) => value.trim().toLowerCase();

export const getLinkNodeId = (node: string | GraphNode) =>
  typeof node === "string" ? node : node.id;

export const getEdgeKey = (sourceId: string, targetId: string) =>
  sourceId < targetId ? `${sourceId}__${targetId}` : `${targetId}__${sourceId}`;

export const getEntryLabel = (entry: TranslationEntry) =>
  entry.pair[0]?.original?.word ?? entry.uuid ?? "Unknown word";

export const sortEntriesByPrimaryWord = (entries: TranslationEntry[]) =>
  [...entries].sort((a, b) =>
    (a.pair?.[0]?.original?.word ?? "").localeCompare(
      b.pair?.[0]?.original?.word ?? "",
      undefined,
      { sensitivity: "base" },
    ),
  );

export const entryMatchesQuery = (entry: TranslationEntry, query: string) => {
  if (!query) return true;
  const normalized = normalizeWord(query);
  return entry.pair.some((pair) => {
    const original = pair.original?.word?.toLowerCase() ?? "";
    if (original.includes(normalized)) return true;
    return (
      pair.translations?.some((translation) =>
        (translation.word?.toLowerCase() ?? "").includes(normalized),
      ) ?? false
    );
  });
};

export const nodeMatchesQuery = (node: GraphNode, query: string, exact = false) => {
  if (!query) return true;
  const normalized = normalizeWord(query);
  const label = node.label?.toLowerCase() ?? "";
  const labelMatch = exact ? label === normalized : label.includes(normalized);
  if (labelMatch) return true;
  const wordData = node.wordData;
  if (!wordData) return false;
  return wordData.pair.some((pair) => {
    const original = pair.original?.word?.toLowerCase() ?? "";
    if (exact ? original === normalized : original.includes(normalized)) return true;
    return (
      pair.translations?.some((translation) => {
        const value = translation.word?.toLowerCase() ?? "";
        return exact ? value === normalized : value.includes(normalized);
      }) ?? false
    );
  });
};
