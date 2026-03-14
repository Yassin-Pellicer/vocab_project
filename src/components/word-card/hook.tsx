import { useConfigStore } from "@/context/dictionary-context";
import type { OriginalTranslationPair } from "@/types/original-translation-pair";
import type { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

const EMPTY_PAIR: OriginalTranslationPair = {
  original: { word: "" },
  translations: [],
  definitions: [],
};

export default function useWordCard(dictId: string, word: TranslationEntry) {
  const pairs = word.pair ?? [];
  const [pairIdx, setPairIdx] = useState(0);

  const currentPair = pairs[pairIdx] ?? EMPTY_PAIR;
  const { dictionaryMetadata } = useConfigStore();

  const original = currentPair.original?.word || "";

  const translations = currentPair.translations
    .map((t) => t.word)
    .filter(Boolean)
    .join(", ");

  const gender = currentPair.original?.gender || "";
  const number = currentPair.original?.number || "";

  const definitions = currentPair.definitions ?? [];

  const article =
    (word.type === dictionaryMetadata?.[dictId]?.typeWordWithPrecededArticle &&
      dictionaryMetadata?.[dictId]?.useArticles)
      ? dictionaryMetadata?.[dictId]?.articles?.[gender]?.[number] || ""
      : "";

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
