import fs from "fs";
import path from "path";
import type { TranslationEntry } from "@/types/translation-entry";

export type GraphPayload = Record<string, Record<string, string>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toUniqueSortedIds = (ids: unknown): string[] => {
  if (!Array.isArray(ids)) return [];

  return Array.from(
    new Set(ids.filter((id): id is string => typeof id === "string")),
  ).sort();
};

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const getEntryLabel = (entry: TranslationEntry, fallback: string) =>
  entry.pair[0]?.original?.word || fallback;

export const getDictionaryFilePath = (route: string, name: string) =>
  path.join(route, `${name}.json`);

export const getLegacyGraphFilePath = (route: string, name: string) =>
  path.join(route, `GRAPH-${name}.json`);

export const readTranslations = (filePath: string): TranslationEntry[] => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? (parsed as TranslationEntry[]) : [];
};

export const writeTranslations = (filePath: string, translations: TranslationEntry[]) => {
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), "utf-8");
};

const readLegacyGraphPayload = (filePath: string): GraphPayload => {
  if (!fs.existsSync(filePath)) return {};

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw || "{}");
    return isRecord(parsed) ? (parsed as GraphPayload) : {};
  } catch (error) {
    console.error("Failed to read legacy graph payload:", error);
    return {};
  }
};

export const normalizeTranslationGraphLinks = (
  translations: TranslationEntry[],
  legacyGraph: GraphPayload = {},
): boolean => {
  const entryMap = new Map<string, TranslationEntry>();
  translations.forEach((entry) => {
    if (!entry.uuid) return;
    entryMap.set(entry.uuid, entry);
  });

  const linkSets = new Map<string, Set<string>>();
  entryMap.forEach((entry, entryId) => {
    const existingIds = toUniqueSortedIds(entry.linkedWordIds).filter(
      (targetId) => targetId !== entryId && entryMap.has(targetId),
    );
    linkSets.set(entryId, new Set(existingIds));
  });

  Object.entries(legacyGraph).forEach(([sourceId, targets]) => {
    if (!entryMap.has(sourceId) || !isRecord(targets)) return;

    Object.keys(targets).forEach((targetId) => {
      if (targetId === sourceId) return;
      if (!entryMap.has(targetId)) return;
      linkSets.get(sourceId)?.add(targetId);
    });
  });

  linkSets.forEach((targets, sourceId) => {
    Array.from(targets).forEach((targetId) => {
      if (targetId === sourceId || !linkSets.has(targetId)) {
        targets.delete(targetId);
        return;
      }
      linkSets.get(targetId)?.add(sourceId);
    });
  });

  let changed = false;
  entryMap.forEach((entry, entryId) => {
    const nextIds = Array.from(linkSets.get(entryId) ?? []).sort();
    const prevIds = toUniqueSortedIds(entry.linkedWordIds).filter(
      (targetId) => targetId !== entryId && entryMap.has(targetId),
    );
    if (!arraysEqual(prevIds, nextIds)) {
      changed = true;
    }
    entry.linkedWordIds = nextIds;
  });

  return changed;
};

export const loadTranslationsWithGraphLinks = (
  route: string,
  name: string,
): {
  dictionaryFilePath: string;
  legacyGraphFilePath: string;
  translations: TranslationEntry[];
  changed: boolean;
} => {
  const dictionaryFilePath = getDictionaryFilePath(route, name);
  const legacyGraphFilePath = getLegacyGraphFilePath(route, name);

  if (!fs.existsSync(dictionaryFilePath)) {
    throw new Error(`The file ${dictionaryFilePath} does not exist.`);
  }

  const translations = readTranslations(dictionaryFilePath);
  const legacyGraph = readLegacyGraphPayload(legacyGraphFilePath);
  const changed = normalizeTranslationGraphLinks(translations, legacyGraph);

  return {
    dictionaryFilePath,
    legacyGraphFilePath,
    translations,
    changed,
  };
};

export const buildGraphPayload = (translations: TranslationEntry[]): GraphPayload => {
  const payload: GraphPayload = {};
  const entryMap = new Map<string, TranslationEntry>();

  translations.forEach((entry) => {
    if (!entry.uuid) return;
    entryMap.set(entry.uuid, entry);
    payload[entry.uuid] = {};
  });

  entryMap.forEach((entry, entryId) => {
    const targets = entry.linkedWordIds ?? [];
    targets.forEach((targetId) => {
      const targetEntry = entryMap.get(targetId);
      if (!targetEntry) return;
      payload[entryId][targetId] = getEntryLabel(targetEntry, targetId);
    });
  });

  return payload;
};

export const removeLegacyGraphFileIfExists = (legacyGraphFilePath: string) => {
  if (!fs.existsSync(legacyGraphFilePath)) return;

  try {
    fs.unlinkSync(legacyGraphFilePath);
  } catch (error) {
    console.error("Failed to remove legacy graph file:", error);
  }
};
