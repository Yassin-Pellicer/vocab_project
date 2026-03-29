import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { useNavigate } from "react-router-dom"
import { ExternalLink } from "lucide-react"
import { DictionaryContext } from "@/context/dictionary-context"
import WordCard from "@/components/word-card"
import type { MouseEvent } from "react"

const LinkedWordNoteView = ({ node }: NodeViewProps) => {
  const navigate = useNavigate()
  const dictionaries = DictionaryContext((state) => state.dictionaries)

  const { route, name, wordId, label, displayMode } = node.attrs as {
    route: string
    name: string
    wordId: string
    label: string
    displayMode: "link" | "card"
  }

  const word = dictionaries[name]?.find((entry) => entry.uuid === wordId)
  const title = word?.pair?.[0]?.original?.word ?? label ?? "Linked word"

  const openWordMarkdown = () => {
    if (!wordId) return
    navigate(
      `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}&uuid=${encodeURIComponent(wordId)}`,
    )
  }

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      (event.target as HTMLElement).closest("button, a, input, textarea, select, label")
    ) {
      return
    }
    openWordMarkdown()
  }

  return (
    <NodeViewWrapper className="linked-word-note-node">
      <div className="w-full rounded-xl border border-border p-3 hover:bg-secondary/10">
        {displayMode === "card" && word ? (
          <div onClick={handleCardClick} className="cursor-pointer">
            <WordCard name={name} word={word} />
          </div>
        ) : (
          <button
            type="button"
            onClick={openWordMarkdown}
            className="flex items-center gap-2 text-primary underline-offset-2 hover:underline"
          >
            <span>{title}</span>
            <ExternalLink size={14} className="opacity-70" />
          </button>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const LinkedWordNoteNode = Node.create({
  name: "linkedWordNote",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      route: { default: "" },
      name: { default: "" },
      wordId: { default: "" },
      label: { default: "" },
      displayMode: { default: "link" },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-type='linked-word-note']" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "linked-word-note" }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkedWordNoteView)
  },
})
