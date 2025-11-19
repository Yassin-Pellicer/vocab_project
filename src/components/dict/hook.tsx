import useConfigStore from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useTranslationHooks({ route, name }: { route: string; name: string }) {
  const ITEMS_PER_PAGE = 15;
  const { list, loadTranslations, selectedLetter, setSelectedLetter, searchField, setSearchField, isFlipped, setIsFlipped } = useConfigStore();
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdditionOrder, setIsAdditionOrder] = useState(!useConfigStore.getState().selectedLetter);
  const setSelectedWord = useConfigStore((state: any) => state.setSelectedWord);

  const navigate = useNavigate();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addWordButtonRef = useRef<HTMLButtonElement>(null);

  const filteredWords = useMemo(() => {
    if (!list) return [];
    let results = [];

    if (searchField.trim() === "") {
      if (isAdditionOrder) {
        results = list;
      } else {
        results = list.filter((word) =>
          word.original?.toUpperCase().startsWith(selectedLetter?.toUpperCase?.() || "")
        );
      }
    } else {
      results = list.filter((word) =>
        word.original?.toLowerCase().includes(searchField.toLowerCase()) || word.translation?.toLowerCase().includes(searchField.toLowerCase())
      );
    }

    if (!isAdditionOrder) {
      return results.sort((a, b) => a.original.localeCompare(b.original));
    }
    
    return results;
  }, [list, selectedLetter, searchField, isAdditionOrder]);

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
    if (isAdditionOrder) {
      setIsAdditionOrder(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isLetter = /^[a-zA-Z]$/.test(e.key);

      if (e.key === "F1") {
        setSelectedWord(filteredWords?.length ? filteredWords[0] : paginatedWords?.[0] || null);
        navigate(
          `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}`,
        );
      }

      if (e.altKey && isLetter) {
        e.preventDefault();
        handleLetterClick(e.key.toUpperCase());
        return;
      }

      if (e.key === "Enter" && !e.altKey && e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addWordButtonRef.current?.click();
        return;
      }

      const dialogOpen = !!document.querySelector('[role="dialog"][data-state="open"]');
      const active = document.activeElement;
      const search = searchRef.current;

      if (
        isLetter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !dialogOpen &&
        active !== search &&
        active?.tagName !== "INPUT" &&
        active?.tagName !== "TEXTAREA" &&
        active?.getAttribute("contenteditable") !== "true"
      ) {
        e.preventDefault();
        search?.focus();
        setSearchField(searchField + e.key);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSearchField("");
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchField]);
  
  useEffect(() => {
    loadTranslations(route, name);
  }, []);

  useEffect(() => {
    setSearchField("");
  }, [selectedLetter]);

  return {
    list,
    history,
    setHistory,
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
    searchRef,
    addWordButtonRef,
    isFlipped,
    setIsFlipped,
    isAdditionOrder,
    setIsAdditionOrder,
  };
}
