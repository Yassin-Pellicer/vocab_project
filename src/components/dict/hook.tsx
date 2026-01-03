import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useTranslationHooks({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const ITEMS_PER_PAGE = 15;
  const {
    dictionaries,
    loadTranslations,
    selectedLetter,
    setSelectedLetter,
    searchField,
    setSearchField,
    isFlipped,
    setIsFlipped,
    setDualView,
    dualView,
    selectedTypes,
  } = useConfigStore();
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdditionOrder, setIsAdditionOrder] = useState(
    !useConfigStore.getState().selectedLetter
  );
  const setSelectedWord = useConfigStore((state: any) => state.setSelectedWord);
  const navigate = useNavigate();
  const list = dictionaries[name] || [];

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addWordButtonRef = useRef<HTMLButtonElement>(null);

  const availableTypes = useMemo(() => {
    if (!list) return [];
    const typesSet = new Set<string>();
    list.forEach((word) => {
      if (word.type) {
        typesSet.add(word.type);
      }
    });
    return Array.from(typesSet).sort();
  }, [list]);

  const filteredWords = useMemo(() => {
    if (!list) return [];
    let results = [];

    if (searchField.trim() === "") {
      if (isAdditionOrder) {
        results = list;
      } else {
        results = list.filter((word) =>
          word.pair.some((p) =>
            p.original?.word
              .toUpperCase()
              .startsWith(selectedLetter?.toUpperCase?.())
          )
        );
      }
    } else {
      results = list.filter((word) =>
        word.pair.some(
          (p) =>
            p.original?.word
              .toLowerCase()
              .includes(searchField.toLowerCase()) ||
            p.translations?.some((t) =>
              t.word.toLowerCase().includes(searchField.toLowerCase())
            )
        )
      );
    }

    if (selectedTypes.length > 0) {
      results = results.filter(
        (word) => word.type && selectedTypes.includes(word.type)
      );
    }

    if (!isAdditionOrder) {
      return results.sort((a, b) =>
        a.pair[0].original.word.localeCompare(b.pair[0].original.word)
      );
    }
    return results;
  }, [list, selectedLetter, searchField, isAdditionOrder, selectedTypes]);

  const totalPages = useMemo(
    () => Math.ceil(filteredWords.length / ITEMS_PER_PAGE),
    [filteredWords.length]
  );

  const paginatedWords = useMemo(
    () =>
      filteredWords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredWords, currentPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredWords, totalPages, currentPage]);

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
    const handleResize = () => {
      if (window.innerWidth <= 1000) setDualView(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      if (e.key === "F1") {
        setSelectedWord(
          filteredWords?.length ? filteredWords[0] : paginatedWords?.[0] || null
        );
        if (dualView) {
          return;
        }
        navigate(
          `/markdown?path=${encodeURIComponent(
            route
          )}&name=${encodeURIComponent(name)}`
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

      const dialogOpen = !!document.querySelector(
        '[role="dialog"][data-state="open"]'
      );
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
  }, [
    searchField,
    filteredWords,
    paginatedWords,
    dualView,
    route,
    name,
    setSelectedWord,
    navigate,
    addWordButtonRef,
    setSearchField,
    handleLetterClick,
  ]);

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
    isFlipped,
    setIsFlipped,
    isAdditionOrder,
    setIsAdditionOrder,
    dualView,
    setDualView,
    availableTypes,
  };
}
