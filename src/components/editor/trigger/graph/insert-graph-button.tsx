import { useState } from "react"
import { Button } from "@/components/ui/tiptap/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"
import { GitGraph } from "lucide-react"
import GraphInsertModal from "./insert-graph-modal"

export function InsertGraphButton({
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
      <Button className="bg-transparent!" onClick={() => setOpen(true)}>
        <GitGraph size={16} />
      </Button>

      <GraphInsertModal
        editor={editor}
        route={route}
        name={name}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}