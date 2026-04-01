import { DictionaryContext } from "@/context/dictionary-context";
import type { OriginalTranslationPair } from "@/types/original-translation-pair";
import type { TranslationEntry } from "@/types/translation-entry";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type GameDirection = "forward" | "reverse" | "mixed";
export type EffectiveGameDirection = "forward" | "reverse";
export type TranslationGameStage = "setup" | "playing";

type GameCandidate = {
  key: string;
  entry: TranslationEntry;
  pairIndex: number;
};

export type TranslationGameQuestion = {
  key: string;
  entry: TranslationEntry;
  selectedPairIndex: number;
  direction: EffectiveGameDirection;
  promptLabel: string;
  answerLabel: string;
  acceptedAnswers: string[];
  definitions: string[];
};

export type TranslationGameHistoryEntry = {
  question: TranslationGameQuestion;
  status: "correct" | "incorrect";
  submittedAnswer: string;
  feedbackText: string;
  hintsUsed: number;
  pointsEarned: number;
};

const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

const normalizeText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createSeededRandom = (seed: number) => {
  let current = seed >>> 0;
  return () => {
    current += 0x6d2b79f5;
    let value = Math.imul(current ^ (current >>> 15), 1 | current);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleCandidates = (candidates: GameCandidate[], seed: number) => {
  const next = [...candidates];
  const random = createSeededRandom(seed || 1);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const isPairTrainable = (pair: OriginalTranslationPair | undefined) =>
  Boolean(
    pair?.original?.word?.trim() &&
    pair.translations?.some((translation) => translation.word?.trim()),
  );

const entryMatchesSearch = (entry: TranslationEntry, query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const typeMatch = normalizeText(entry.type ?? "").includes(normalizedQuery);
  if (typeMatch) return true;

  return entry.pair.some((pair) => {
    const original = normalizeText(pair.original?.word ?? "");
    if (original.includes(normalizedQuery)) return true;

    return pair.translations.some((translation) =>
      normalizeText(translation.word ?? "").includes(normalizedQuery),
    );
  });
};

const getSessionSeed = () => Date.now() + Math.floor(Math.random() * 10_000);

export default function useTranslationGame({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const loadTranslations = DictionaryContext((state) => state.loadTranslations);
  const storedList = DictionaryContext((state) => state.dictionaries[name]);
  const metadata = DictionaryContext((state) => state.dictionaryMetadata[name]);
  const list = storedList ?? EMPTY_TRANSLATIONS;

  const [stage, setStage] = useState<TranslationGameStage>("setup");
  const [direction, setDirection] = useState<GameDirection>("forward");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<TranslationGameQuestion | null>(null);
  const [history, setHistory] = useState<TranslationGameHistoryEntry[]>([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    tone: "correct" | "incorrect";
    text: string;
  } | null>(null);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const advanceTimeoutRef = useRef<number | null>(null);
  const bagRef = useRef<GameCandidate[]>([]);
  const recentCandidateKeysRef = useRef<string[]>([]);
  const sessionSeedRef = useRef(getSessionSeed());
  const turnRef = useRef(0);

  const availableTypes = useMemo(() => {
    const fromMetadata = metadata?.typeWords?.filter(Boolean) ?? [];
    if (fromMetadata.length > 0) return fromMetadata;

    return [...new Set(list.map((entry) => entry.type?.trim()).filter(Boolean) as string[])];
  }, [list, metadata?.typeWords]);

  const filteredWords = useMemo(() => {
    return list.filter((entry) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(entry.type)) {
        return false;
      }

      return entryMatchesSearch(entry, searchQuery);
    });
  }, [list, searchQuery, selectedTypes]);

  const filteredCandidates = useMemo<GameCandidate[]>(() => {
    return filteredWords.flatMap((entry, entryIndex) =>
      entry.pair
        .map((pair, pairIndex) => ({ pair, pairIndex }))
        .filter(({ pair }) => isPairTrainable(pair))
        .map(({ pairIndex }) => ({
          key: `${entry.uuid ?? `${entryIndex}-${entry.dateAdded}`}:${pairIndex}`,
          entry,
          pairIndex,
        })),
    );
  }, [filteredWords]);

  const previewWord = filteredWords[0] ?? null;

  const resetRoundState = useCallback(() => {
    setUserInput("");
    setFeedback(null);
    setRevealedHintCount(0);
  }, []);

  const getQuestionFromCandidate = useCallback(
    (candidate: GameCandidate): TranslationGameQuestion | null => {
      const pair = candidate.entry.pair[candidate.pairIndex];
      if (!isPairTrainable(pair)) return null;

      const nextDirection =
        direction === "mixed"
          ? hashString(`${sessionSeedRef.current}|${candidate.key}|${turnRef.current}`) % 2 === 0
            ? "forward"
            : "reverse"
          : direction;

      if (nextDirection === "forward") {
        const acceptedAnswers = pair.translations
          .map((translation) => translation.word?.trim())
          .filter(Boolean) as string[];

        return {
          key: candidate.key,
          entry: candidate.entry,
          selectedPairIndex: candidate.pairIndex,
          direction: nextDirection,
          promptLabel: pair.original.word,
          answerLabel: acceptedAnswers.join(", "),
          acceptedAnswers,
          definitions: pair.definitions ?? [],
        };
      }

      const translations = pair.translations
        .map((translation) => translation.word?.trim())
        .filter(Boolean) as string[];
      const promptIndex =
        translations.length <= 1
          ? 0
          : hashString(`${sessionSeedRef.current}|prompt|${candidate.key}|${turnRef.current}`) %
            translations.length;

      return {
        key: candidate.key,
        entry: candidate.entry,
        selectedPairIndex: candidate.pairIndex,
        direction: nextDirection,
        promptLabel: translations[promptIndex] ?? translations[0] ?? pair.original.word,
        answerLabel: pair.original.word,
        acceptedAnswers: [pair.original.word],
        definitions: pair.definitions ?? [],
      };
    },
    [direction],
  );

  const refillBag = useCallback(() => {
    bagRef.current = shuffleCandidates(
      filteredCandidates,
      hashString(`${sessionSeedRef.current}|${turnRef.current}|${filteredCandidates.length}`),
    );
  }, [filteredCandidates]);

  const queueNextQuestion = useCallback(() => {
    if (filteredCandidates.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    const validKeys = new Set(filteredCandidates.map((candidate) => candidate.key));
    bagRef.current = bagRef.current.filter((candidate) => validKeys.has(candidate.key));

    if (bagRef.current.length === 0) {
      refillBag();
    }

    const recentKeys = recentCandidateKeysRef.current;
    let nextIndex = bagRef.current.findIndex(
      (candidate) => !recentKeys.includes(candidate.key),
    );

    if (nextIndex === -1) {
      nextIndex = 0;
    }

    const [candidate] = bagRef.current.splice(nextIndex, 1);
    if (!candidate) {
      setCurrentQuestion(null);
      return;
    }

    turnRef.current += 1;
    recentCandidateKeysRef.current = [...recentKeys, candidate.key].slice(-6);
    setCurrentQuestion(getQuestionFromCandidate(candidate));
  }, [filteredCandidates, getQuestionFromCandidate, refillBag]);

  const startSession = useCallback(() => {
    if (filteredCandidates.length === 0) return;

    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    sessionSeedRef.current = getSessionSeed();
    recentCandidateKeysRef.current = [];
    turnRef.current = 0;
    refillBag();
    setHistory([]);
    setScore(0);
    setAnsweredCount(0);
    resetRoundState();
    setStage("playing");
    queueNextQuestion();
  }, [filteredCandidates.length, queueNextQuestion, refillBag, resetRoundState]);

  const returnToSetup = useCallback(() => {
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setStage("setup");
    setFeedback(null);
  }, []);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  }, []);

  const clearTypeFilters = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  const showHint = useCallback(() => {
    if (!currentQuestion || currentQuestion.definitions.length === 0) return;

    setRevealedHintCount((current) =>
      Math.min(currentQuestion.definitions.length, current + 1),
    );
  }, [currentQuestion]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentQuestion) return;

      const submittedAnswer = userInput.trim();
      const normalizedAnswer = normalizeText(submittedAnswer);
      if (!normalizedAnswer) return;

      const isCorrect = currentQuestion.acceptedAnswers.some(
        (answer) => normalizeText(answer) === normalizedAnswer,
      );
      const hintsUsed = Math.min(
        revealedHintCount,
        currentQuestion.definitions.length,
      );
      const pointsBase = currentQuestion.definitions.length || 1;
      const pointsEarned = isCorrect
        ? Math.max(0, 1 - hintsUsed / pointsBase)
        : 0;

      const feedbackText = isCorrect
        ? `Correct. +${pointsEarned.toFixed(2)} points.`
        : `Expected: ${currentQuestion.answerLabel}.`;

      setFeedback({
        tone: isCorrect ? "correct" : "incorrect",
        text: feedbackText,
      });
      setAnsweredCount((current) => current + 1);
      if (isCorrect) {
        setScore((current) => current + pointsEarned);
      }

      setHistory((current) => [
        {
          question: currentQuestion,
          status: isCorrect ? "correct" : "incorrect",
          submittedAnswer,
          feedbackText,
          hintsUsed,
          pointsEarned,
        },
        ...current,
      ]);

      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
      }

      advanceTimeoutRef.current = window.setTimeout(() => {
        resetRoundState();
        queueNextQuestion();
      }, isCorrect ? 900 : 1400);
    },
    [currentQuestion, queueNextQuestion, resetRoundState, revealedHintCount, userInput],
  );

  useEffect(() => {
    void loadTranslations(route, name);
  }, [loadTranslations, name, route]);

  useEffect(() => {
    if (stage !== "playing") return;
    if (filteredCandidates.length > 0 || history.length > 0) return;

    setCurrentQuestion(null);
    setStage("setup");
  }, [filteredCandidates.length, history.length, stage]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  return {
    stage,
    list,
    currentQuestion,
    history,
    score,
    answeredCount,
    userInput,
    setUserInput,
    feedback,
    revealedHints: currentQuestion?.definitions.slice(0, revealedHintCount) ?? [],
    showHint,
    handleSubmit,
    startSession,
    returnToSetup,
    availableTypes,
    selectedTypes,
    toggleType,
    clearTypeFilters,
    direction,
    setDirection,
    searchQuery,
    setSearchQuery,
    filteredWords,
    filteredCandidates,
    previewWord,
  };
}
