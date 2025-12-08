export interface OriginalTranslationPair {
  original: { word: string, gender?: string, number?: string; };
  translations: { word: string, gender?: string, number?: string; }[];
  definitions: string[];
}