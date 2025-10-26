import { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

export default function useWordModalHooks() {
  const [formData, setFormData] = useState<TranslationEntry>({
    original: "",
    translation: "",
    gender: "",
    number: "",
    definitions: [""],
    type: "",
    observations: "",
    dateAdded: new Date().toISOString().split("T")[0],
  });

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
      if(!formData.original || !formData.translation) return;
      await (window.api as any).addTranslation(formData);
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
