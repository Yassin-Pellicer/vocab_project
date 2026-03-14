import { useNotesStore } from "@/context/notes-context";
import { notify } from "@/services/notify";
import { SidebarNode } from "@/types/sidebar-types";

export default function useDeleteNoteModalHooks(
  dictRoute: string,
  dictName: string,
  item: SidebarNode | null,
) {
  const { removeById } = useNotesStore();

  const removeNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) {
        const title = item.title;
        removeById(item.id);
        await window.api.saveNoteIndex(dictRoute, dictName, useNotesStore.getState().tree);
        notify("noteDeleted", { title, dictionary: dictName });
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return {
    removeNote,
  };
}
