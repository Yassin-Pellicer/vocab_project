import { useState } from "react"
import { Button } from "@/components/ui/tiptap/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"
import { Notebook } from "lucide-react"
import ReferenceNoteModal from "./reference-note-modal"

export function ReferenceNoteButton({
  editor,
  route,
  name,
}: {
  editor: Editor | null
  route: string
  name: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        role="button"
        tabIndex={-1}
        tooltip={"Insert Graph"}
        onClick={() => setOpen(true)}>
        <Notebook size={16} />
      </Button>

      <ReferenceNoteModal
        editor={editor}
        route={route}
        name={name}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}