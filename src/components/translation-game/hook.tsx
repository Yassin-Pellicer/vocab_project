import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useCallback, useEffect, useRef, useState } from "react";

interface SelectedWord extends TranslationEntry {
  selectedPairIndex: number;
}

export default function useTranslationHooks({ route, name }: { route: string, name: string }) {
  
  const [list, setList] = useState<TranslationEntry[]>([]);
  const [word, setWord] = useState<SelectedWord | null>(null);
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [maxHints, setMaxHints] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastHistoryRef = useRef<HTMLDivElement>(null);

  const { isFlipped } = DictionaryContext();

  const selectedPair = word?.pair[word.selectedPairIndex];
  const originalWord = selectedPair?.original.word || "";
  const translations = selectedPair?.translations || [];
  const definitions = selectedPair?.definitions || [];

  const loadTranslations = useCallback(async (_route: string, _name: string) => {
    try {
      const data = await window.api.requestTranslations(_route, _name);
      if (data) setList(data);
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  }, []);

  const selectRandom = useCallback(() => {
    if (!Array.isArray(list) || list.length === 0) return null;

    const randomEntryIndex = Math.floor(Math.random() * list.length);
    const selectedEntry = list[randomEntryIndex];

    const randomPairIndex = Math.floor(
      Math.random() * selectedEntry.pair.length,
    );

    setWord({
      ...selectedEntry,
      selectedPairIndex: randomPairIndex,
    });
  }, [list]);

  useEffect(() => {
    if (word && list.length > 0) {
      setMessage("");
    }
  }, [word, list.length]);

  useEffect(() => {
    if (lastHistoryRef.current) {
      lastHistoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    void loadTranslations(route, name);
  }, [loadTranslations, name, route]);

  useEffect(() => {
    if (list.length > 0) {
      selectRandom();
    }
  }, [list.length, selectRandom]);

  const showHint = () => {
    if (!definitions || definitions.length === 0) {
      setHint("No definitions found.");
      return;
    }

    setHint(definitions[hintIndex]);

    if (hintIndex === definitions.length - 1) {
      setMaxHints(true);
    }

    setHintIndex((prev) => (prev + 1) % definitions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !selectedPair) return;

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswers = !isFlipped
      ? translations.map((t) => t.word.toLowerCase())
      : [selectedPair.original.word.toLowerCase()];

    const historyEntry: TranslationEntryResult = {
      ...word,
      original: originalWord,
      translation: translations.map(t => t.word).join(", "),
      definitions: definitions,
      selectedPairIndex: word.selectedPairIndex,
      hintsUsed: maxHints ? definitions.length : hintIndex,
      status: "incorrect",
      message: "❌"
    };

    if (correctAnswers.includes(userAnswer)) {
      const pointsEarned = 1 - ((hintIndex || 0) / (definitions.length || 1));
      setScore((prev) => prev + pointsEarned);
      setMessage("✔️ Correct!");
      historyEntry.message = "✔️ Correct!";
      historyEntry.status = "correct";
    } else {
      historyEntry.message = `❌ Incorrect answer: ${correctAnswers.join(", ")}; \t Your answer: ${userAnswer || "🤔"}.`;
      setMessage(`❌ Incorrect. The answer was: ${correctAnswers.join(", ")}.`);
      historyEntry.status = "incorrect";
    }

    setTimeout(() => {
      setUserInput("");
      setMessage("");
      setHint(null);
      setMaxHints(false);
      setHintIndex(0);
      setHistory((prev) => [...prev, historyEntry]);
      selectRandom();
    }, 1500);
  };

  return {
    list,
    history,
    word,
    selectRandom,
    setHistory,
    buttonRef,
    userInput,
    setUserInput,
    score,
    message,
    lastHistoryRef,
    hint,
    showHint,
    handleSubmit,
  };
}
