import { TranslationEntry } from "@/types/translation-entry";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useMemo, useRef, useState } from "react";

export default function useTranslationHooks() {
  const ITEMS_PER_PAGE = 10;

  const [list, setList] = useState<TranslationEntry[]>([]);
  const [word, setWord] = useState<TranslationEntry | null>(null);
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [currentPage, setCurrentPage] = useState(1);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredWords = useMemo(() => {
    return list
      .filter((word) => word.original.toUpperCase().startsWith(selectedLetter))
      .sort((a, b) => a.original.localeCompare(b.original));
  }, [list, selectedLetter]);

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

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
    selectedLetter,
    setSelectedLetter,
    currentPage,
    setCurrentPage,
    alphabet,
    filteredWords,
    totalPages,
    paginatedWords,
    handlePrevPage,
    handleNextPage,
    handleLetterClick,
    scrollRef,
  };
}
