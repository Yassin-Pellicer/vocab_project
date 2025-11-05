import useConfigStore from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useMemo, useRef, useState } from "react";

export default function useTranslationHooks({ route, name }: { route: string, name: string }) {
  const ITEMS_PER_PAGE = 10;

  const { list, loadTranslations } = useConfigStore();
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [searchField, setSearchField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredWords = useMemo(() => {
    if (!list) return [];

    let results = [];

    if (searchField.trim() === "") {
      results = list.filter((word) =>
        word.original?.toUpperCase().startsWith(selectedLetter?.toUpperCase?.() || "")
      );
    } else {
      results = list.filter((word) =>
        word.original?.toLowerCase().includes(searchField.toLowerCase())
      );
    }
    
    return results.sort((a, b) => a.original.localeCompare(b.original));
  }, [list, selectedLetter, searchField]);

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
    loadTranslations(route, name);
  }, []);

  return {
    list,
    history,
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
    searchField,
    setSearchField,
    handleLetterClick,
    scrollRef,
  };
}
