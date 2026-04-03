import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_ADVANCE_DELAYS } from "./constants";
import {
  getSessionSeed,
  hashString,
  isPairTrainable,
  normalizeText,
  shuffleCandidates,
} from "./game-utils";
import type {
  GameCandidate,
  GameDirection,
  TranslationGameFeedback,
  TranslationGameHistoryEntry,
  TranslationGameQuestion,
  TranslationGameStage,
} from "./types";

type UseTranslationGameSessionParams = {
  filteredCandidates: GameCandidate[];
  direction: GameDirection;
};

type UseTranslationGameSessionResult = {
  stage: TranslationGameStage;
  currentQuestion: TranslationGameQuestion | null;
  history: TranslationGameHistoryEntry[];
  score: number;
  answeredCount: number;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  feedback: TranslationGameFeedback | null;
  revealedHints: string[];
  showHint: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  startSession: () => void;
  returnToSetup: () => void;
};

export function useTranslationGameSession({
  filteredCandidates,
  direction,
}: UseTranslationGameSessionParams): UseTranslationGameSessionResult {
  const [stage, setStage] = useState<TranslationGameStage>("setup");
  const [currentQuestion, setCurrentQuestion] =
    useState<TranslationGameQuestion | null>(null);
  const [history, setHistory] = useState<TranslationGameHistoryEntry[]>([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<TranslationGameFeedback | null>(null);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const advanceTimeoutRef = useRef<number | null>(null);
  const bagRef = useRef<GameCandidate[]>([]);
  const recentCandidateKeysRef = useRef<string[]>([]);
  const sessionSeedRef = useRef(getSessionSeed());
  const turnRef = useRef(0);

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
          : hashString(
              `${sessionSeedRef.current}|prompt|${candidate.key}|${turnRef.current}`,
            ) % translations.length;

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
      const pointsEarned = isCorrect ? Math.max(0, 1 - hintsUsed / pointsBase) : 0;

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
      }, isCorrect ? QUESTION_ADVANCE_DELAYS.correct : QUESTION_ADVANCE_DELAYS.incorrect);
    },
    [currentQuestion, queueNextQuestion, resetRoundState, revealedHintCount, userInput],
  );

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
  };
}
