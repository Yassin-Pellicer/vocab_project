import { TranslationEntry } from "@/types/translation-entry";
import { TranslationEntryResult } from "@/types/translation-entry-result";
import { useEffect, useRef, useState } from "react";

export default function useTranslationHooks() {
  const [list, setList] = useState<TranslationEntry[]>([]);
  const [word, setWord] = useState<TranslationEntry | null>(null);
  const [history, setHistory] = useState<TranslationEntryResult[]>([]);

  const [hint, setHint] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [maxHints, setMaxHints] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastHistoryRef = useRef<HTMLDivElement>(null);

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
    loadTranslations();
  }, []);

  useEffect(() => {
    if (list.length > 0) {
      selectRandom()
    }
  }, [list]);

  const showHint = () => {
    if (!word || !word.definitions || word.definitions.length === 0) { setHint("No definitions found."); return; }
    setHint(word.definitions[hintIndex]);
    if (hintIndex === word.definitions.length - 1) setMaxHints(true);
    setHintIndex((prev) => (prev + 1) % word.definitions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word) return;

    const historyEntry = word as TranslationEntryResult;

    if (userInput.trim().toLowerCase() === word.original.toLowerCase()) {
      setScore((prev) =>
        prev + (1 - ((hintIndex || 0) / (word.definitions.length || 1)))
      );
      setMessage("✔️ Correct!");
      historyEntry.message = "✔️";
      historyEntry.status = "correct";
    } else {
      setMessage(`❌ Incorrect.`);
      historyEntry.message = `❌`;
      historyEntry.status = "incorrect";
    }

    historyEntry.hintsUsed = hintIndex;
    if (maxHints) historyEntry.hintsUsed = word.definitions.length;

    setTimeout(() => {
      setUserInput("");
      setMessage("");
      setHint(null);
      setMaxHints(false);
      setHintIndex(0);
      setHistory([...history, historyEntry]);
      selectRandom();
    }, 1000);
  };

  const loadTranslations = async () => {
    try {
      const data = await (window.api).requestTranslations();
      if (data) {
        setList(data);
      }
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  };

  const selectRandom = () => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    setWord(list[randomIndex])
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
    handleSubmit
  };
}
