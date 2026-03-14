import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

export default function DictionaryGraphView({ node }: NodeViewProps) {
  const { route, name, title, doubleView, word } = node.attrs as {
    route: string
    name: string
    title: string
    doubleView: boolean
    word: string
  }

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
