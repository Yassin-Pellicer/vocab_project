import { useConfigStore } from "@/context/dictionary-context";
import { notify } from "@/services/notify";
import { TranslationEntry } from "@/types/translation-entry";

export default function useDeleteWordModalHooks({
  word,
  route,
  name,
}: {
  word: TranslationEntry;
  route: string;
  name: string;
}) {
  const { loadTranslations } = useConfigStore();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await window.api.deleteTranslation(word.uuid!, route, name);
      const label =
        word.pair.find((p) => p.original.word.trim())?.original.word.trim() ??
        "word";
      notify("wordDeleted", { word: label, dictionary: name });
      loadTranslations(route, name);
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  return {
    handleSubmit,
  };
}
