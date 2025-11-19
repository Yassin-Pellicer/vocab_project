import { TranslationEntry } from "@/types/translation-entry";
import useConfigStore from "@/context/dictionary-context";
import { useEffect, useState } from "react";

interface DictionaryData {
  name: string;
  path: string;
  id: string;
  wordOfTheDay: TranslationEntry | null;
  recentWords: TranslationEntry[];
  totalWords: number;
}

export default function useHome() {
  const { data } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState<DictionaryData[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalDictionaries, setTotalDictionaries] = useState(0);

  const loadWordOfTheDay = async () => {
    if (!data.navMain || data.navMain.length === 0) {
      setLoading(false);
      return;
    }

    const dictionaryList = data.navMain.filter(
      (item) => item.items && item.items.length > 0
    );

    if (dictionaryList.length === 0) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const seed = hashCode(dateString);

    const seededRandom = (max: number, seedValue: number) => {
      const x = Math.sin(seedValue) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };

    const allDictionaries: DictionaryData[] = [];
    let wordCount = 0;

    for (const dict of dictionaryList) {
      const firstSubItem = dict.items?.[0];
      if (firstSubItem) {
        const urlParams = new URLSearchParams(firstSubItem.url.split("?")[1]);
        const path = urlParams.get("path") || "";
        const name = urlParams.get("name") || "";

        try {
          const translations = await window.api.requestTranslations(path, name);

          if (translations && translations.length > 0) {
            wordCount += translations.length;

            const wordIndex = seededRandom(translations.length, seed + allDictionaries.length);
            const wordOfTheDay = translations[wordIndex];

            const sorted = [...translations].sort((a, b) => {
              const dateA = new Date(a.dateAdded).getTime();
              const dateB = new Date(b.dateAdded).getTime();
              return dateB - dateA;
            });
            const recentWords = sorted.slice(0, 3);

            allDictionaries.push({
              name: dict.title,
              path,
              id: name,
              wordOfTheDay,
              recentWords,
              totalWords: translations.length,
            });
          }
        } catch (error) {
          console.error(`Failed to load dictionary ${dict.title}:`, error);
        }
      }
    }

    setDictionaries(allDictionaries);
    setTotalWords(wordCount);
    setTotalDictionaries(dictionaryList.length);
    setLoading(false);
  };

  useEffect(() => {
    loadWordOfTheDay();
  });

  return {
    dictionaries,
    loading,
    totalWords,
    totalDictionaries,
  };
}
