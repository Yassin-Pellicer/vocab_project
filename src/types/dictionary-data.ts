import { TranslationEntry } from "./translation-entry";

export interface DictionaryData {
  name: string;
  path: string;
  id: string;
  wordOfTheDay: TranslationEntry | null;
  recentWords: TranslationEntry[];
  totalWords: number;
}