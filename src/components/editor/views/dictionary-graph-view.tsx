import { NodeViewWrapper } from "@tiptap/react"
import DictionaryGraph from "@/components/knowledge-graph"

export default function DictionaryGraphView({ node }: { node: any }) {
  const { route, name, title, doubleView } = node.attrs

  return (
    <NodeViewWrapper className="dictionary-graph-node">
      <div style={{ height: "500px", width: "100%" }}>
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