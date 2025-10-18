import { TranslationEntry } from "@/types/translation-entry";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useRef, useState } from "react";

export default function useTranslationHooks() {
  const [list, setList] = useState<TranslationEntry[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [word, setWord] = useState<TranslationEntry | null>(null);
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);

  useEffect(() => {
    loadTranslations();
  }, []);

  useEffect(() => {
    if (list.length > 0) {
      selectRandom()
    }
  }, [list]);

  const loadTranslations = async () => {
    try {
      const data = await (window.api as any).requestTranslations();
      if (data) {
        setList(data);
      }
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  };

  const selectRandom = () => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    setWord(list[randomIndex])
  };

  return {
    list,
    history,
    word,
    selectRandom,
    setHistory,
    buttonRef,
  };
}
