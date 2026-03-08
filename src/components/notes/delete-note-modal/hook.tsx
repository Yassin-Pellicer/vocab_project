import { useNotesStore } from "@/context/notes-context";
import { SidebarNode } from "@/types/sidebar-types";

export default function hook(dictRoute: string, dictName: string, item: SidebarNode | null) {
  const { removeById } = useNotesStore();

  const removeNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (item) {
        removeById(item.id);
        await window.api.saveNoteIndex(dictRoute, dictName, useNotesStore.getState().tree);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return {
    removeNote,
  };
}
