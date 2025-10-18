import { TranslationEntry } from "./translation-entry";

export type TranslationEntryResult = TranslationEntry & {
  status: string
  message: string
  hintsUsed: number
}
