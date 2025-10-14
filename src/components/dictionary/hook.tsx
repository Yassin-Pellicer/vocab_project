import { useEffect, useRef, useState } from "react";

export default function useTranslationHooks() {
  const [list, setList] = useState<Record<string, string>>({});
  const [pair, setPair] = useState<{ article?: string; word: string; translation: string }>({
    article: "",
    word: "",
    translation: "",
  });
  const [history, setHistory] = useState<{ article?: string; word: string; translation: string }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  useEffect(() => {
    if (Object.keys(list).length > 0) {
      selectRandom();
    }
  }, [list]);

  const loadTranslations = async () => {
    try {
      const data = await (window.api as any).requestTranslations();
      if (data) {
        setList(data);
      }
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  };

  const selectRandom = () => {
    const keys = Object.keys(list);
    if (keys.length === 0) return;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const [article, word, translation] = split(randomKey, list[randomKey]);
    setPair({ article, word, translation });
    setHistory((prev) => [...prev, { article, word, translation }]);
  };

  const split = (key: string, value: string) => {
    const [article, word] = key.split(" ");
    return [article, word, value];
  };

  return {
    list,
    pair,
    history,
    selectRandom,
    buttonRef,
  };
}
