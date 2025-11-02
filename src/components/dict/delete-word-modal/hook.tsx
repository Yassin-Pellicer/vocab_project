import { TranslationEntry } from "@/types/translation-entry";

export default function deleteWordModalHooks({word, route, name} : {word: TranslationEntry, route: string, name: string} ) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (window.api).deleteTranslation(word, route, name);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  return {
    handleSubmit,
  };
}
