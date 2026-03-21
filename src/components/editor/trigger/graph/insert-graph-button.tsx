import { useState } from "react"
import { Button } from "@/components/ui/tiptap/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"
import { GitGraph } from "lucide-react"
import GraphInsertModal from "./insert-graph-modal"

export function InsertGraphButton({
  editor,
  route,
  name,
  doubleView = true,
}: {
  editor: Editor | null
  route: string
  name: string
  doubleView?: boolean
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
        <GitGraph size={16} />
      </Button>
      <GraphInsertModal
        editor={editor}
        route={route}
        name={name}
        open={open}
        setOpen={setOpen}
        doubleView={doubleView}
      />
    </>
  )
}
