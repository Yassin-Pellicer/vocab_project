import { useConfigStore } from "@/context/dictionary-context";
import { DictionaryData } from "@/types/dictionary-data";
import { useEffect, useState } from "react";

export default function useHome() {
  const dictionaryMetadata = useConfigStore(s => s.dictionaryMetadata);
  const dictionariesMap = useConfigStore(s => s.dictionaries);
  const [loading, setLoading] = useState(true);
  const [dictionaryCards, setDictionaryCards] = useState<DictionaryData[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalDictionaries, setTotalDictionaries] = useState(0);

  useEffect(() => {
    if (
      Object.keys(dictionaryMetadata).length === 0 ||
      Object.keys(dictionariesMap).length === 0
    ) {
      return;
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const seed = hashCode(dateString);

    const seededRandom = (max: number, seedValue: number) => {
      const x = Math.sin(seedValue) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    const result: DictionaryData[] = [];
    let wordCount = 0;

    Object.entries(dictionaryMetadata).forEach(([id, meta], index) => {
      const translations = dictionariesMap[id];
      if (!translations || translations.length === 0) return;

      const wordIndex = seededRandom(translations.length, seed + index);
      const wordOfTheDay = translations[wordIndex];

      const recentWords = [...translations]
        .sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() -
            new Date(a.dateAdded).getTime()
        )
        .slice(0, 3);

      wordCount += translations.length;

      result.push({
        id,
        name: meta.name,
        path: meta.route,
        wordOfTheDay,
        recentWords,
        totalWords: translations.length,
      });
    });

    setDictionaryCards(result);
    setTotalWords(wordCount);
    setTotalDictionaries(result.length);
    setLoading(false);
  }, [dictionaryMetadata, dictionariesMap]);

  return {
    dictionaryCards,
    loading,
    totalWords,
    totalDictionaries,
  };
}
