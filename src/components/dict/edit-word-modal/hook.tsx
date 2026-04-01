import { DictionaryContext } from "@/context/dictionary-context";
import { notify } from "@/services/notify";
import { OriginalTranslationPair } from "@/types/original-translation-pair";
import { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

export default function useEditWordModalHooks({
  word,
  route,
  name,
}: {
  word: TranslationEntry;
  route: string;
  name: string;
}) {
  const { loadTranslations, setSelectedWord } = DictionaryContext();
  const [formData, setFormData] = useState<TranslationEntry>(
    structuredClone(word),
  );

  const emptyPair: OriginalTranslationPair = {
    original: {
      word: "",
      gender: "",
      number: "",
    },
    translations: [
      {
        word: "",
        gender: "",
        number: "",
      },
    ],
    definitions: [],
  };

  const setPairField = (value: string, pairIndex: number, path: string) => {
    const newPairs = [...formData.pair];
    const parts = path.split(".");
    let cursor: unknown = newPairs[pairIndex];

    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cursor !== "object" || cursor === null) return;
      cursor = (cursor as Record<string, unknown>)[parts[i]];
    }

    if (typeof cursor !== "object" || cursor === null) return;
    (cursor as Record<string, unknown>)[parts[parts.length - 1]] = value;

    setFormData({ ...formData, pair: newPairs });
  };

  const handlePairChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    pairIndex: number,
    path: string,
  ) => setPairField(e.target.value, pairIndex, path);

  const addPair = () => {
    setFormData({
      ...formData,
      pair: [...formData.pair, structuredClone(emptyPair)],
    });
  };

  const removePair = (pairIndex: number) => {
    const updated = formData.pair.filter((_, idx) => idx !== pairIndex);
    setFormData({ ...formData, pair: updated });
  };

  const addTranslationToPair = (pairIndex: number) => {
    const updated = [...formData.pair];
    updated[pairIndex].translations.push({ word: "", gender: "", number: "" });
    setFormData({ ...formData, pair: updated });
  };

  const removeTranslationFromPair = (pairIndex: number, tIndex: number) => {
    const updated = [...formData.pair];
    updated[pairIndex].translations = updated[pairIndex].translations.filter(
      (_, i) => i !== tIndex
    );
    setFormData({ ...formData, pair: updated });
  };

  const addDefinitionToPair = (pairIndex: number) => {
    const updated = [...formData.pair];
    updated[pairIndex].definitions.push("");
    setFormData({ ...formData, pair: updated });
  };

  const removeDefinitionFromPair = (pairIndex: number, dIndex: number) => {
    const updated = [...formData.pair];
    updated[pairIndex].definitions = updated[pairIndex].definitions.filter(
      (_, i) => i !== dIndex
    );
    setFormData({ ...formData, pair: updated });
  };

  const handleSubmit = async () => {
    try {
      if (formData.pair.length === 0) return false;
      if (!word.uuid) throw new Error("Cannot edit word without uuid.");

      await window.api.addTranslation(formData, word.uuid, route, name);
      const before =
        word.pair.find((p) => p.original.word.trim())?.original.word.trim() ??
        "word";
      const after =
        formData.pair.find((p) => p.original.word.trim())?.original.word.trim() ??
        before;
      notify("wordEdited", { before, after, dictionary: name });
      await loadTranslations(route, name);
      const refreshedWord =
        DictionaryContext.getState().dictionaries[name]?.find((entry) => entry.uuid === word.uuid) ??
        formData;
      setSelectedWord(name, refreshedWord);
      return true;
    } catch (error) {
      console.error("Failed to add translation:", error);
      return false;
    }
  };

  return {
    formData,
    setFormData,
    handlePairChange,
    setPairField,
    addPair,
    removePair,
    addTranslationToPair,
    removeTranslationFromPair,
    addDefinitionToPair,
    removeDefinitionFromPair,
    handleSubmit,
  };
}
