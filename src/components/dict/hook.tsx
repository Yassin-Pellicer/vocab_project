import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import type { TranslationEntry } from "@/types/translation-entry";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PointerEvent as ReactPointerEvent } from "react";

const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

export default function useTranslationHooks({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const ITEMS_PER_PAGE = 50;
  const {
    dictionaries,
    loadTranslations,
    selectedLetter,
    setSelectedLetter,
    searchField,
    setSearchField,
    isFlipped,
    setIsFlipped,
    selectedTypes,
    setGraphMode,
    graphMode,
  } = useConfigStore();

  const navigate = useNavigate();
  const list = dictionaries[name] ?? EMPTY_TRANSLATIONS;
  const [currentPage, setCurrentPage] = useState(1);

  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const setSelectedWord = useConfigStore((state) => state.setSelectedWord);
  const selectedWord = useConfigStore((state) => state.selectedWord);
  const [isAdditionOrder, setIsAdditionOrder] = useState(
    () => !useConfigStore.getState().selectedLetter,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addWordButtonRef = useRef<HTMLButtonElement>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const { dictionaryMetadata } = useConfigStore();

  const availableTypes = dictionaryMetadata?.[name]?.typeWords ?? [];

  const [splitViewCollapsed, setSplitViewCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("chat-sidebar");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.collapsed);
    } catch {
      return false;
    }
  });

  const [splitViewWidth, setSplitViewWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("chat-sidebar");
      if (!raw) return 392;
      const parsedJson = JSON.parse(raw);
      const parsed = Number(parsedJson?.width);
      return Number.isFinite(parsed) ? parsed : 392;
    } catch {
      return 392;
    }
  });

  // Refs so pointermove always reads fresh values without re-creating the handler
  const splitViewWidthRef = useRef(splitViewWidth);
  const splitViewCollapsedRef = useRef(splitViewCollapsed);
  useEffect(() => { splitViewWidthRef.current = splitViewWidth; }, [splitViewWidth]);
  useEffect(() => { splitViewCollapsedRef.current = splitViewCollapsed; }, [splitViewCollapsed]);

  useEffect(() => {
    if (selectedWord && splitViewCollapsedRef.current) {
      setSplitViewCollapsed(false);
      setSplitViewWidth(Math.floor(window.innerWidth / 1.6));
    }
  }, [selectedWord]);

  const handleResizeSplitView = useCallback((e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = splitViewCollapsedRef.current ? 0 : splitViewWidthRef.current;
    const minWidth = 260;
    const maxWidth = Math.floor(window.innerWidth / 1.6);

    const onMove = (ev: PointerEvent) => {
      const rawNext = startWidth + (startX - ev.clientX);
      if (rawNext < minWidth) {
        setSplitViewCollapsed(true);
        return;
      }
      setSplitViewCollapsed(false);
      setSplitViewWidth(Math.min(maxWidth, Math.max(minWidth, rawNext)));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []); // stable — reads live values via refs

  useEffect(() => {
    try {
      localStorage.setItem(
        "dictionary-sidebar",
        JSON.stringify({ width: splitViewWidth, collapsed: splitViewCollapsed }),
      );
    } catch {
      // ignore
    }
  }, [splitViewWidth, splitViewCollapsed]);

  const filteredWords = useMemo(() => {
    if (!list) return [];
    let results = list;

    if (searchField.trim() === "") {
      if (isAdditionOrder) {
        results = list;
      } else {
        results = list.filter((word) =>
          word.pair.some((p) =>
            p.original?.word.toUpperCase().startsWith(selectedLetter.toUpperCase())
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
      return [...results].sort((a, b) =>
        a.pair[0].original.word.localeCompare(b.pair[0].original.word)
      );
    }
    return results.slice().reverse();
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

  const handleLetterClick = useCallback((letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
    if (isAdditionOrder) {
      setIsAdditionOrder(false);
    }
  }, [isAdditionOrder, setSelectedLetter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      if (e.key === "F1") {
        setSelectedWord(
          filteredWords?.length ? filteredWords[0] : paginatedWords?.[0] || null
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
    route,
    name,
    setSelectedWord,
    navigate,
    setSearchField,
    handleLetterClick,
  ]);

  useEffect(() => {
    void loadTranslations(route, name);
  }, [loadTranslations, route, name]);

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
    availableTypes,
    graphMode,
    setGraphMode,
    splitViewWidth,
    splitViewCollapsed,
    handleResizeSplitView,
  };
}