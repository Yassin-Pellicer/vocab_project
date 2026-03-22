import { SimpleEditor } from "@/components/ui/tiptap/tiptap-templates/simple/simple-editor";
import { NotesContext } from "@/context/notes-context";

export default function NoteDisplay({
  route,
  name,
  noteId,
  editMode,
}: {
  route: string;
  name: string;
  noteId?: string;
  editMode?: boolean;
}) {
  const { selectedNoteId } = NotesContext();
  return (
    <div className="flex justify-center align-center p-4">
      {route && name && (noteId || selectedNoteId) ? (
        <SimpleEditor
          route={route}
          name={name}
          type={"notes"}
          noteId={noteId}
          editMode={editMode}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)]">
          <p className="text-md text-foreground">
            Select a note to view or edit
          </p>
        </div>
      )}
    </div>
  );
}
