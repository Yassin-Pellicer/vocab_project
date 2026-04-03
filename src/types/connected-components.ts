import type { TranslationEntry } from "./translation-entry";

export type DictionaryConnectedComponent = {
  id: string;
  nodeIds: string[];
  words: TranslationEntry[];
  representative: TranslationEntry;
  connectionCount: number;
};
