import { useState } from "react"
import { Editor } from "@tiptap/react"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/tiptap/tiptap-ui-primitive/button"
import InsertLinkedWordModal from "./insert-linked-word-modal"

export function InsertLinkedWordButton({
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
        tooltip={"Insert Linked Word"}
        onClick={() => setOpen(true)}
      >
        <Link2 size={16} />
      </Button>
      <InsertLinkedWordModal
        editor={editor}
        route={route}
        name={name}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
