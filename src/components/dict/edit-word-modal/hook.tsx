import useConfigStore from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

export default function useWordModalHooks({ word, route, name }: { word: TranslationEntry, route: string, name: string }) {
  const [formData, setFormData] = useState<TranslationEntry>(word);
  const { loadTranslations } = useConfigStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === "definition" && typeof index === "number") {
      const newDefs = [...formData.definitions];
      newDefs[index] = value;
      setFormData({ ...formData, definitions: newDefs });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addDefinition = () => {
    setFormData({ ...formData, definitions: [...formData.definitions, ""] });
  };

  const removeDefinition = (index: number) => {
    const newDefs = formData.definitions.filter((_, i) => i !== index);
    setFormData({ ...formData, definitions: newDefs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.original || !formData.translation) return;
      await (window.api).addTranslation(formData, word, route, name);
      loadTranslations(route, name);
    }
    catch (error) {
      console.error("Failed to add translation:", error);
    }
  };

  return {
    handleChange,
    addDefinition,
    removeDefinition,
    handleSubmit,
    formData,
  };
}
