import type { OriginalTranslationPair } from "@/types/original-translation-pair";
import type { TranslationEntry } from "@/types/translation-entry";
import type { GameCandidate } from "./types";

export const normalizeText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createSeededRandom = (seed: number) => {
  let current = seed >>> 0;
  return () => {
    current += 0x6d2b79f5;
    let value = Math.imul(current ^ (current >>> 15), 1 | current);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleCandidates = (candidates: GameCandidate[], seed: number) => {
  const next = [...candidates];
  const random = createSeededRandom(seed || 1);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

export const isPairTrainable = (pair: OriginalTranslationPair | undefined) =>
  Boolean(
    pair?.original?.word?.trim() &&
      pair.translations?.some((translation) => translation.word?.trim()),
  );

export const entryMatchesSearch = (entry: TranslationEntry, query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const typeMatch = normalizeText(entry.type ?? "").includes(normalizedQuery);
  if (typeMatch) return true;

  return entry.pair.some((pair) => {
    const original = normalizeText(pair.original?.word ?? "");
    if (original.includes(normalizedQuery)) return true;

    return pair.translations.some((translation) =>
      normalizeText(translation.word ?? "").includes(normalizedQuery),
    );
  });
};

export const getSessionSeed = () => Date.now() + Math.floor(Math.random() * 10_000);

export const getEntryLabel = (entry: TranslationEntry) =>
  entry.pair[0]?.original?.word?.trim() || entry.uuid || "Unknown word";

export const getEdgeKey = (sourceId: string, targetId: string) =>
  sourceId < targetId ? `${sourceId}__${targetId}` : `${targetId}__${sourceId}`;
