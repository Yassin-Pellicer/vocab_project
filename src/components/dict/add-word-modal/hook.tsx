import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState } from "react";

export default function useWordModalHooks({ route, name }: { route: string, name: string }) {
  const { loadTranslations } = useConfigStore();
  const [open, setOpen] = useState(false);
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

  const handleSubmit = async () => {
    try {
      if (!formData.original || !formData.translation) return;
      await (window.api).addTranslation(formData, null, route, name);
      loadTranslations(route, name);
    }
    catch (error) {
      console.error("Failed to add translation:", error);
    }
  };

  return {
    open,
    setOpen,
    handleChange,
    addDefinition,
    removeDefinition,
    handleSubmit,
    formData,
  };
}
