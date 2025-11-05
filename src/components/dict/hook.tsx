import useConfigStore from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useMemo, useRef, useState } from "react";

export default function useTranslationHooks({ route, name }: { route: string; name: string }) {
  const ITEMS_PER_PAGE = 10;
  const { list, loadTranslations } = useConfigStore();
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [searchField, setSearchField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addWordButtonRef = useRef<HTMLButtonElement>(null);

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
  const handleKeyDown = (e: KeyboardEvent) => {
    const isLetter = /^[a-zA-Z]$/.test(e.key);

    // Alt + Letter → select alphabet letter
    if (e.altKey && isLetter) {
      e.preventDefault();
      setSelectedLetter(e.key.toUpperCase());
      setCurrentPage(1);
      return;
    }

    // Enter → trigger Add Word modal
    if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      addWordButtonRef.current?.click();
      return;
    }

    // Typing → focus search field (only if not in dialog or input)
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
      setSearchField((prev) => prev + e.key);
    }

    // Escape → blur active element
    if (e.key === "Escape") {
      e.preventDefault();
      document.activeElement instanceof HTMLElement &&
        document.activeElement.blur();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);



  useEffect(() => {
    loadTranslations(route, name);
  }, []);

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
  };
}
