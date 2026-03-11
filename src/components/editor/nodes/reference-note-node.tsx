import { useNotesStore } from "@/context/notes-context"
import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"

const ReferenceNoteView = ({ node }: { node: any }) => {
  const { selectedNoteId, title, route } = node.attrs
  const { setSelectedNoteId } = useNotesStore();
  return (
    <NodeViewWrapper className="reference-note-node">
      <div 
      onClick={() => setSelectedNoteId(selectedNoteId)}
      className="w-full border rounded-xl p-4 cursor-pointer hover:bg-secondary/50">
        <p>
          {title || "Reference Note"} (ID: {selectedNoteId})
        </p>
        <p className="text-sm text-foreground/70">{route}</p>
      </div>
    </NodeViewWrapper>
  )
}

export const ReferenceNoteNode = Node.create({
  name: "referenceNote",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      selectedNoteId: { default: null },
      title: { default: null },
      route: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: "div[data-type='reference-note']" }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "reference-note" }),
      0,
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ReferenceNoteView)
  },
})