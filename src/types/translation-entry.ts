import { OriginalTranslationPair } from "./original-translation-pair";

export type TranslationEntry = {
  uuid?: string;
  pair: OriginalTranslationPair[];
  dateAdded: string;
  type: string;
}

