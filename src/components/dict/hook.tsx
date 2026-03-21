import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import type { TranslationEntry } from "@/types/translation-entry";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const list = dictionaries[name] ?? EMPTY_TRANSLATIONS;
  const [currentPage, setCurrentPage] = useState(1);

  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
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
      const raw = localStorage.getItem("dictionary-sidebar");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.collapsed);
    } catch {
      return false;
    }
  });

  const [splitViewWidth, setSplitViewWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("dictionary-sidebar");
      if (!raw) {
        if (typeof window === "undefined") return 392;
        const available = Math.max(0, window.innerWidth - 40);
        return Math.max(280, Math.floor(available / 2));
      }
      const parsedJson = JSON.parse(raw);
      const parsed = Number(parsedJson?.width);
      return Number.isFinite(parsed) ? parsed : 392;
    } catch {
      return 392;
    }
  });

  const splitViewWidthRef = useRef(splitViewWidth);
  const splitViewCollapsedRef = useRef(splitViewCollapsed);
  const didApplyInitialCenterRef = useRef(false);
  const didUserResizeRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const alphabetRef = useRef<HTMLDivElement>(null);
  useEffect(() => { splitViewWidthRef.current = splitViewWidth; }, [splitViewWidth]);
  useEffect(() => { splitViewCollapsedRef.current = splitViewCollapsed; }, [splitViewCollapsed]);

  const getMaxSplitWidth = useCallback(() => {
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const alphabetWidth = graphMode
      ? 0
      : (alphabetRef.current?.getBoundingClientRect().width ?? 40);
    const minMainWidth = Math.min(500, Math.floor(containerWidth * 0.55));
    return Math.max(0, Math.floor(containerWidth - alphabetWidth - minMainWidth));
  }, [graphMode]);

  const clampSplitWidth = useCallback((value: number) => {
    const maxWidth = getMaxSplitWidth();
    if (maxWidth <= 0) return 0;
    const minWidth = Math.min(360, maxWidth);
    return Math.min(maxWidth, Math.max(minWidth, value));
  }, [getMaxSplitWidth]);

  const handleResizeSplitView = useCallback((e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    didUserResizeRef.current = true;
    const startX = e.clientX;
    const startWidth = splitViewCollapsedRef.current ? 0 : splitViewWidthRef.current;

    const onMove = (ev: PointerEvent) => {
      const rawNext = startWidth + (startX - ev.clientX);
      const clamped = clampSplitWidth(rawNext);
      setSplitViewCollapsed(false);
      setSplitViewWidth(clamped);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [clampSplitWidth]);

  useEffect(() => {
    if (didApplyInitialCenterRef.current || didUserResizeRef.current) return;
    try {
      const raw = localStorage.getItem("dictionary-sidebar");
      if (raw) return;
    } catch {
      // ignore
    }
    const next = clampSplitWidth(splitViewWidthRef.current);
    if (next !== splitViewWidthRef.current) {
      setSplitViewWidth(next);
    }
    if (splitViewCollapsedRef.current) return;
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const alphabetWidth = graphMode
      ? 0
      : (alphabetRef.current?.getBoundingClientRect().width ?? 40);
    const available = Math.max(0, containerWidth - alphabetWidth);
    const centered = clampSplitWidth(Math.floor(available / 2));
    setSplitViewWidth(centered);
    didApplyInitialCenterRef.current = true;
  }, [clampSplitWidth, graphMode]);

  useEffect(() => {
    const handleResize = () => {
      const next = clampSplitWidth(splitViewWidthRef.current);
      if (next > 0 && next !== splitViewWidthRef.current) {
        setSplitViewWidth(next);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clampSplitWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
      if (containerWidth <= 0) return;
      const next = clampSplitWidth(splitViewWidthRef.current);
      if (next > 0 && next !== splitViewWidthRef.current) {
        setSplitViewWidth(next);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [clampSplitWidth]);

  useEffect(() => {
    const next = clampSplitWidth(splitViewWidthRef.current);
    if (next !== splitViewWidthRef.current) {
      setSplitViewWidth(next);
    }
  }, [clampSplitWidth, graphMode]);

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

  const expandSplitViewChat = useCallback(() => {
    const minWidth = 260;
    const maxWidth = getMaxSplitWidth();
    if (maxWidth < minWidth) {
      setSplitViewCollapsed(true);
      return;
    }
    setSplitViewCollapsed(false);
    setSplitViewWidth(Math.max(minWidth, Math.min(500, maxWidth)));
  }, [getMaxSplitWidth]);


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
    expandSplitViewChat
  };
}
