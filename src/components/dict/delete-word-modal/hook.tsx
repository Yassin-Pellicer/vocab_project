import { TranslationEntry } from "@/types/translation-entry";

export default function deletewordModalHooks(word: TranslationEntry) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (window.api).deleteTranslation(word);
    } catch (error) {
      console.error("Failed to add translation:", error);
    }
  };

  return {
    handleSubmit,
  };
}
