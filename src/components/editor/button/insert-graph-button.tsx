import { Button } from "@/components/tiptap-ui-primitive/button"
import { Editor } from "@tiptap/react"
import { GitGraph } from "lucide-react"

export function InsertGraphButton({ editor, route, name }: { editor: Editor | null, route:string, name:string }) {
  const insertGraph = () => {
    if (!editor) return

    editor.commands.insertContent({
      type: "dictionaryGraph",
      attrs: {
        route: route,
        name: name,
        title: "",
        doubleView: false,
      },
    })
  }

  return (
    <Button className="bg-transparent!" onClick={insertGraph}>
      <GitGraph size={16}></GitGraph>
    </Button>
  )
}