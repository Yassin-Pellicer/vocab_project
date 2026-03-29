import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

const DictionaryGraphView = ({ node, updateAttributes }: NodeViewProps) => {
  const { route, name, title, doubleView, word, wordId, directOnly } = node.attrs as {
    route: string
    name: string
    title: string
    doubleView: boolean
    word: string
    wordId: string
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
          initialWordId={wordId}
          showDirectToggle={false}
          showBottomSelector={false}
          showGoBackButton={false}
          autoSelectRandomWord={false}
          selectionScope="local"
          navigateOnWordClick={true}
          directOnlyOverride={directOnly}
          onWordSelected={(selected) => {
            updateAttributes({
              word: selected.pair?.[0]?.original?.word ?? "",
              wordId: selected.uuid ?? "",
            })
          }}
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
      wordId: { default: "" },
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
