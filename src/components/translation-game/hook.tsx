import { TranslationEntry } from "@/types/translation-entry";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useRef, useState } from "react";

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

  // Get the selected pair's data
  const selectedPair = word?.pair[word.selectedPairIndex];
  const originalWord = selectedPair?.original.word || "";
  const translations = selectedPair?.translations || [];
  const definitions = selectedPair?.definitions || [];

  useEffect(() => {
    if (word && list.length > 0) {
      setMessage("");
    }
  }, [word]);

  useEffect(() => {
    if (lastHistoryRef.current) {
      lastHistoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    loadTranslations(route, name);
  }, []);

  useEffect(() => {
    if (list.length > 0) {
      selectRandom();
    }
  }, [list]);

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
    const correctAnswer = originalWord.toLowerCase();
    
    // Create history entry from the selected pair
    const historyEntry: TranslationEntryResult = {
      ...word,
      original: originalWord,
      translation: translations[0]?.word || "",
      definitions: definitions,
      hintsUsed: maxHints ? definitions.length : hintIndex,
      status: "incorrect",
      message: "❌"
    };

    if (userAnswer === correctAnswer) {
      const pointsEarned = 1 - ((hintIndex || 0) / (definitions.length || 1));
      setScore((prev) => prev + pointsEarned);
      setMessage("✔️ Correct!");
      historyEntry.message = "✔️";
      historyEntry.status = "correct";
    } else {
      setMessage(`❌ Incorrect. The answer was: ${originalWord}`);
      historyEntry.message = `❌ Correct answer: ${originalWord}`;
      historyEntry.status = "incorrect";
    }

    setTimeout(() => {
      setUserInput("");
      setMessage("");
      setHint(null);
      setMaxHints(false);
      setHintIndex(0);
      setHistory([...history, historyEntry]);
      selectRandom();
    }, 1500);
  };

  const loadTranslations = async (route: string, name: string) => {
    try {
      const data = await window.api.requestTranslations(route, name);
      if (data) setList(data);
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  };

  const selectRandom = () => {
    if (!Array.isArray(list) || list.length === 0) return null;

    // Select a random entry from the list
    const randomEntryIndex = Math.floor(Math.random() * list.length);
    const selectedEntry = list[randomEntryIndex];

    // Select a random pair from within that entry
    const randomPairIndex = Math.floor(Math.random() * selectedEntry.pair.length);

    setWord({
      ...selectedEntry,
      selectedPairIndex: randomPairIndex
    });
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