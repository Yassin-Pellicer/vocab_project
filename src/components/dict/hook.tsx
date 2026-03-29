import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import type { TranslationEntry } from "@/types/translation-entry";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useResizablePanel } from "@/hooks/use-resizable-panel";

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
    dictionaryMetadata,
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
  } = DictionaryContext();

  const list = dictionaries[name] ?? EMPTY_TRANSLATIONS;
  const [currentPage, setCurrentPage] = useState(1);

  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [isAdditionOrder, setIsAdditionOrder] = useState(
    () => !DictionaryContext.getState().selectedLetter,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addWordButtonRef = useRef<HTMLButtonElement>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const availableTypes = dictionaryMetadata?.[name]?.typeWords ?? [];

  const containerRef = useRef<HTMLDivElement>(null);
  const alphabetRef = useRef<HTMLDivElement>(null);

  const getMaxSplitWidth = useCallback(() => {
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const alphabetWidth = graphMode
      ? 0
      : (alphabetRef.current?.getBoundingClientRect().width ?? 40);
    const minMainWidth = Math.min(500, Math.floor(containerWidth * 0.55));
    return Math.max(0, Math.floor(containerWidth - alphabetWidth - minMainWidth));
  }, [graphMode]);

  const getInitialSplitWidth = useCallback(() => {
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width ?? 0;
    if (containerWidth <= 0) return null;
    const alphabetWidth = graphMode
      ? 0
      : (alphabetRef.current?.getBoundingClientRect().width ?? 40);
    const available = Math.max(0, containerWidth - alphabetWidth);
    return Math.floor(available / 2);
  }, [graphMode]);

  const {
    width: splitViewWidth,
    collapsed: splitViewCollapsed,
    handleResizeStart: handleResizeSplitView,
  } = useResizablePanel({
    storageKey: "dictionary-sidebar",
    defaultWidth: 392,
    defaultCollapsed: false,
    minWidth: 360,
    maxWidth: getMaxSplitWidth,
    direction: "right",
    containerRef,
    collapseBelowMin: false,
    getInitialWidth: getInitialSplitWidth,
  });

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
    containerRef,
    alphabetRef,
  };
}
