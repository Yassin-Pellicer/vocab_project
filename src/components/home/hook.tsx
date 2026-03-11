import { useConfigStore } from "@/context/dictionary-context";
import { DictionaryData } from "@/types/dictionary-data";
import { SidebarNode, SidebarTree } from "@/types/sidebar-types";
import { useEffect, useState } from "react";

const collectLeafNotes = (tree: SidebarTree): SidebarNode[] => {
  const leaves: SidebarNode[] = [];

  const walk = (nodes: SidebarTree) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        walk(node.children);
      } else {
        leaves.push(node);
      }
    }
  };

  walk(tree);
  return leaves;
};

export default function useHome() {
  const dictionaryMetadata = useConfigStore(s => s.dictionaryMetadata);
  const dictionariesMap = useConfigStore(s => s.dictionaries);
  const [loading, setLoading] = useState(true);
  const [dictionaryCards, setDictionaryCards] = useState<DictionaryData[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalDictionaries, setTotalDictionaries] = useState(0);

  useEffect(() => {
    let isCancelled = false;

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

    const loadHome = async () => {
      setLoading(true);

      const result: DictionaryData[] = [];
      let wordCount = 0;

      const entries = Object.entries(dictionaryMetadata);

      for (const [index, [id, meta]] of entries.entries()) {
        const translations = dictionariesMap[id];
        if (!translations || translations.length === 0) continue;

        const wordIndex = seededRandom(translations.length, seed + index);
        const wordOfTheDay = translations[wordIndex];

        const recentWords = [...translations]
          .sort(
            (a, b) =>
              new Date(b.dateAdded).getTime() -
              new Date(a.dateAdded).getTime()
          )
          .slice(0, 3);

        let randomNote: SidebarNode | null = null;
        try {
          const noteIndex = (await window.api.fetchNoteIndex(
            meta.route,
            id,
          )) as SidebarTree;
          const leaves = collectLeafNotes(Array.isArray(noteIndex) ? noteIndex : []);
          if (leaves.length > 0) {
            randomNote = leaves[seededRandom(leaves.length, seed + index + 10_000)];
          }
        } catch (error) {
          console.error(`Failed loading note index for ${id}:`, error);
        }

        wordCount += translations.length;

        result.push({
          id,
          name: meta.name,
          path: meta.route,
          wordOfTheDay,
          recentWords,
          totalWords: translations.length,
          randomNote,
        });
      }

      if (isCancelled) return;

      setDictionaryCards(result);
      setTotalWords(wordCount);
      setTotalDictionaries(result.length);
      setLoading(false);
    };

    loadHome();

    return () => {
      isCancelled = true;
    };
  }, [dictionaryMetadata, dictionariesMap]);

  return {
    dictionaryCards,
    loading,
    totalWords,
    totalDictionaries,
  };
}
