


import { useState, useEffect } from "react";
import { useConfigStore } from "@/context/dictionary-context";
import { defaultTenses } from "@/types/config";

export default function useConfigureTenseModal(dictId?: string) {
  const { dictionaryMetadata, setDictionaryMetadata, saveConfig } = useConfigStore();


  const [tenses, setTenses] = useState<string[]>([]);
  const [newTense, setNewTense] = useState("");
  const [structure, setStructure] = useState<string>(
    JSON.stringify(defaultTenses, null, 2)
  );

  // load existing structure when dictId or metadata changes
  useEffect(() => {
    if (dictId && dictionaryMetadata[dictId]?.tenses) {
      setStructure(JSON.stringify(dictionaryMetadata[dictId].tenses, null, 2));
    } else {
      setStructure(JSON.stringify(defaultTenses, null, 2));
    }
  }, [dictId, dictionaryMetadata]);

  const addTense = () => {
    const trimmed = newTense.trim();
    if (!trimmed) return;
    setTenses((prev) => [...prev, trimmed]);
    setNewTense("");
  };

  const reset = () => {
    setNewTense("");
    setTenses([]);
    setStructure(
      dictId && dictionaryMetadata[dictId]?.tenses
        ? JSON.stringify(dictionaryMetadata[dictId].tenses, null, 2)
        : JSON.stringify(defaultTenses, null, 2)
    );
  };

  const save = () => {
    if (!dictId) return;
    try {
      const parsed = JSON.parse(structure);
      const updated = { ...dictionaryMetadata };
      updated[dictId] = { ...updated[dictId], tenses: parsed } as any;
      setDictionaryMetadata(updated);
      saveConfig();
    } catch (err) {
      console.error("Invalid JSON structure, could not save tense config", err);
    }
  };

  const loadFromFile = (file: File) => {
    file
      .text()
      .then((text) => setStructure(text))
      .catch((err) => console.error("Failed to read file", err));
  };

  return {
    tenses,
    newTense,
    setNewTense,
    addTense,
    reset,
    structure,
    setStructure,
    save,
    loadFromFile,
  };
}
