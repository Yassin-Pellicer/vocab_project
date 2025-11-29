export interface OriginalTranslationPair {
  original: { word: string; gender?: string; number?: string; };
  translation: { word: string; gender?: string; number?: string; }[];
  definitions: string[];
}