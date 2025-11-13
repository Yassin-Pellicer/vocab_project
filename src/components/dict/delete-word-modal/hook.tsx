import useConfigStore from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";

export default function deleteWordModalHooks({ word, route, name }: { word: TranslationEntry, route: string, name: string }) {
  const { loadTranslations } = useConfigStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (window.api).deleteTranslation(word, route, name);
      loadTranslations(route, name);
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  return {
    handleSubmit,
  };
}
