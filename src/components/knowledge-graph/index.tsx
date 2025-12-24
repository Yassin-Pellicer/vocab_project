import { useRef } from "react";
import { useDictionaryGraph } from "./hook";

export default function DictionaryGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useDictionaryGraph(svgRef);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0f1117"
      }}
    />
  );
}
