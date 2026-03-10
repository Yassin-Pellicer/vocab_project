import { NodeViewWrapper } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

export default function DictionaryGraphView({ node }: { node: any }) {
  const { route, name, title, doubleView, word} = node.attrs

  return (
    <NodeViewWrapper className="dictionary-graph-node">
      <DictionaryGraph
        route={route}
        name={name}
        title={title}
        doubleView={doubleView}
        word={word}
      />
    </NodeViewWrapper>
  )
}