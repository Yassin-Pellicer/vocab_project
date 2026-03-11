import { TranslationEntry } from "./translation-entry";
import { SidebarNode } from "./sidebar-types";

export interface DictionaryData {
  name: string;
  path: string;
  id: string;
  wordOfTheDay: TranslationEntry | null;
  recentWords: TranslationEntry[];
  totalWords: number;
  randomNote: SidebarNode | null;
}