import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

const DictionaryGraphView = ({ node }: NodeViewProps) => {
  const { route, name, title, doubleView, word, directOnly } = node.attrs as {
    route: string
    name: string
    title: string
    doubleView: boolean
    word: string
    directOnly: boolean
  }

  return (
    <NodeViewWrapper className="dictionary-graph-node">
      <div className="w-full h-125 border rounded-xl">
        <DictionaryGraph
          route={route}
          name={name}
          title={title}
          doubleView={doubleView}
          word={word}
          showDirectToggle={false}
          directOnlyOverride={directOnly}
        />
      </div>
    </NodeViewWrapper>
  )
}

export const DictionaryGraphNode = Node.create({
  name: "dictionaryGraph",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      route: { default: "" },
      name: { default: "" },
      title: { default: "" },
      doubleView: { default: false },
      word: { default: "" },
      directOnly: { default: false },
    }
  },
  parseHTML() {
    return [{ tag: "div[data-type='dictionary-graph']" }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "dictionary-graph" }),
      0,
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(DictionaryGraphView)
  },
})
