import { TranslationEntry } from "./translation-entry";

export type TranslationEntryResult = TranslationEntry & {
  original: string
  translation: string
  definitions: string[]
  status: string
  message: string
  hintsUsed: number
}
