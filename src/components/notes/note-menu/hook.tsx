import { useNotesStore } from '@/context/notes-context';
import { useEffect } from 'react';

export default function NoteMenuHook({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const { setTree } = useNotesStore();

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const indexData = await window.api.fetchNoteIndex(route, name);
        console.log("Fetched note index:", indexData);
        setTree(indexData);
      } catch (error) {
        console.error("Error fetching note index:", error);
      }
    };

    fetchIndex();
  }, [route, name]);

  return {};
}