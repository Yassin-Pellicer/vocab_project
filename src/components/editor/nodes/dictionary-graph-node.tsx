import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

const DictionaryGraphView = ({ node }: { node: any }) => {
  const { route, name, title, doubleView } = node.attrs

  return (
    <NodeViewWrapper className="dictionary-graph-node">
      <div className="w-full height-[800px] border rounded-xl">
        <DictionaryGraph
          route={route}
          name={name}
          title={title}
          doubleView={doubleView}
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