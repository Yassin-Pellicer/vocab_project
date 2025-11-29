import { OriginalTranslationPair } from "./original-translation-pair";

export interface TranslationEntry {
  uuid?: string;
  pair: OriginalTranslationPair | OriginalTranslationPair[];
  dateAdded: string;
  type: string;
}
