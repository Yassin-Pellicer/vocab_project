import { useCallback, useEffect, useState } from "react";
import { useConfigStore } from "@/context/dictionary-context";
import { defaultTenses } from "@/types/config";

export default function useConfigureTenseModal(dictId: string) {
  const { dictionaryMetadata, setDictionaryTenses, setTypeWordWithTenses } =
    useConfigStore();
  const [
    selectTypeWordWithTenses,
    setSelectTypeWordWithTenses,
  ] = useState(dictionaryMetadata?.[dictId]?.typeWordWithTenses || "");

  const getStoredStructure = useCallback(() => {
    if (dictId && dictionaryMetadata?.[dictId]?.tenses) {
      return JSON.stringify(dictionaryMetadata?.[dictId]?.tenses, null, 2);
    }
    return JSON.stringify(defaultTenses, null, 2);
  }, [dictId, dictionaryMetadata]);

  const [structure, setStructure] = useState<string>(() => getStoredStructure());

  useEffect(() => {
    setStructure(getStoredStructure());
  }, [getStoredStructure]);

  const resetToStored = () => {
    setStructure(getStoredStructure());
  };

  const reset = () => {
    setStructure(JSON.stringify(defaultTenses, null, 2));
  };

  const save = () => {
    if (!dictId) return;
    try {
      const parsed = JSON.parse(structure);
      setDictionaryTenses(dictId, parsed);
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

  const saveTypeWordWithTenses = (typeWord: string) => {
    setSelectTypeWordWithTenses(typeWord);
    setTypeWordWithTenses(dictId, typeWord);
  };

  return {
    structure,
    metadata: dictionaryMetadata?.[dictId],
    setStructure,
    resetToStored,
    reset,
    save,
    loadFromFile,
    selectTypeWordWithTenses,
    saveTypeWordWithTenses,
  };
}
