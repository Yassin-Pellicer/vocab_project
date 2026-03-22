import { DictionaryContext } from "@/context/dictionary-context";
import { notify } from "@/services/notify";
import { OriginalTranslationPair } from "@/types/original-translation-pair";
import { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

export default function useWordModalHooks({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const { loadTranslations } = DictionaryContext();
  const [open, setOpen] = useState(false);

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

  const template = {
    pair: [emptyPair],
    dateAdded: new Date().toISOString().split("T")[0],
    type: "noun",
  };

  const [formData, setFormData] = useState<TranslationEntry>(template);

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
  ) => {
    setPairField(e.target.value, pairIndex, path);
  };

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
      (_, i) => i !== tIndex,
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
      (_, i) => i !== dIndex,
    );
    setFormData({ ...formData, pair: updated });
  };

  const handleSubmit = async () => {
    try {
      if (formData.pair.length === 0) return;
      await window.api.addTranslation(formData, null, route, name);
      const firstOriginal =
        formData.pair.find((p) => p.original.word.trim())?.original.word.trim() ??
        "word";
      notify("wordAdded", { word: firstOriginal, dictionary: name });
      loadTranslations(route, name);
      setFormData(template);
    } catch (error) {
      console.error("Failed to add translation:", error);
    }
  };

  return {
    open,
    setOpen,
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
