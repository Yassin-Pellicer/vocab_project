import { useState } from "react";

export default function useWordCard(word: any) {
  const pairs = Array.isArray(word.pair) ? word.pair : [word.pair];
  const [pairIdx, setPairIdx] = useState(0);

  const currentPair = pairs[pairIdx] || {};

  const original = currentPair.original?.word || "";

  const translations = Array.isArray(currentPair.translations)
    ? currentPair.translations
        .map((t: { word: string }) => t.word)
        .filter(Boolean)
        .join(", ")
    : typeof currentPair.translations === "object" &&
      currentPair.translations?.word
    ? currentPair.translations.word
    : "";

  const gender = currentPair.original?.gender || "";
  const number = currentPair.original?.number || "";

  const definitions = Array.isArray(currentPair.definitions)
    ? currentPair.definitions
    : [];

  // ✅ gender → article
  const article =
    gender.startsWith("f")
      ? "die"
      : gender.startsWith("m")
      ? "der"
      : gender.startsWith("n")
      ? "das"
      : "";

  // ✅ optional composed word
  const originalWithArticle = article
    ? `${article} ${original}`
    : original;

  return {
    pairs,
    pairIdx,
    setPairIdx,
    currentPair,
    original,
    originalWithArticle, 
    translations,
    gender,
    number,
    article,            
    definitions,
  };
}
