import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import WordCard from "../word-card";
import { GraphLink, GraphNode } from "@/types/graph-types";

const ROOT_ID = "__ROOT__";

export default function DictionaryGraph({
  route,
  name,
  title,
}: {
  route: string;
  name: string;
  title: string;
}) {
  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [showEmptyNodes, setShowEmptyNodes] = useState(true);
  const { dictionaries } = useConfigStore((state: any) => state);
  const list = dictionaries[name] || [];

  const fetchGraph = async () => {
    try {
      const response = await (window as any).api.fetchGraph(route, name);
      console.log("Fetched graph response:", response);

      const nodeIds = new Set<string>([ROOT_ID]);
      const links: GraphLink[] = [];
      const hasIncoming = new Set<string>();

      Object.entries(response).forEach(([sourceId, targets]: [string, any]) => {
        nodeIds.add(sourceId);

        if (targets && typeof targets === "object") {
          Object.keys(targets).forEach((targetId) => {
            nodeIds.add(targetId);
            hasIncoming.add(targetId);

            links.push({
              source: sourceId,
              target: targetId,
            });
          });
        }
      });

      Object.entries(response).forEach(([sourceId, targets]: [string, any]) => {
        const isEmpty =
          !targets || (typeof targets === "object" && Object.keys(targets).length === 0);

        const isOrphan = isEmpty && !hasIncoming.has(sourceId);

        if (isOrphan) {
          links.push({
            source: ROOT_ID,
            target: sourceId,
          });
        }
      });

      const nodes: GraphNode[] = Array.from(nodeIds).map((id) => {
        if (id === ROOT_ID) {
          return {
            id: ROOT_ID,
            label: title,
            parent: true,
          };
        }

        const wordData = list.find((entry: TranslationEntry) => entry.uuid === id);

        return {
          id,
          label: wordData?.pair[0]?.original?.word ?? id,
          parent: false,
          wordData,
        };
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error("Error fetching graph:", error);
    }
  };

  useEffect(() => {
    if (route && name && list.length > 0) {
      fetchGraph();
    }
  }, [route, name, list]);

  useEffect(() => {
    fetchGraph();
    console.log(list)
  }, []);

  useEffect(() => {
    if (!graphData) return;

    const { nodes, links } = graphData;
    const width = window.innerWidth;
    const height = window.innerHeight;

    d3.select("#graph-svg").selectAll("*").remove();

    const svg = d3.select("#graph-svg").attr("viewBox", [0, 0, width, height]);
    const container = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
        container.attr("transform", e.transform);
      }) as any
    );

    let filteredNodes = nodes;
    let filteredLinks = links;

    if (!showEmptyNodes) {
      const emptyNodeIds = new Set(
        links
          .filter(link => typeof link.source === 'object' && link.source.id === ROOT_ID)
          .map(link => typeof link.target === 'string' ? link.target : link.target.id)
      );

      filteredNodes = nodes.filter(
        node => node.id !== ROOT_ID && !emptyNodeIds.has(node.id)
      );

      filteredLinks = links.filter(
        link => (typeof link.target === 'object' && !emptyNodeIds.has(link.target.id))
      );
    }

    const simulation = d3
      .forceSimulation(filteredNodes)
      .force(
        "link",
        d3.forceLink(filteredLinks)
          .id((d: any) => d.id)
          .distance((d: any) => (d.source as any).parent || (d.target as any).parent ? 100 : 80)
          .strength(0.7)
      )
      .force("charge", d3.forceManyBody().strength((d: any) => (d.parent ? -200 : -120)))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => (d.parent ? 50 : 30)))
      .alpha(1)
      .alphaDecay(0.1);

    const link = container
      .append("g")
      .selectAll("line")
      .data(filteredLinks)
      .join("line")
      .attr("stroke", "#9ca3af")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5);

    const node = container
      .append("g")
      .selectAll("g")
      .data(filteredNodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded) as any
      )
      .on("mouseover", (_event, d) => {
        if (!d.wordData) return;
        setTooltipWord(d.wordData);
      })

    node
      .append("circle")
      .attr("r", (d: any) => (d.parent ? 28 : 14))
      .attr("fill", "#d1d5db")
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d: any) => d.label)
      .attr("dy", (d: any) => (d.parent ? 6 : -18))
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "12px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x)
        .attr("y1", (d: any) => (d.source as any).y)
        .attr("x2", (d: any) => (d.target as any).x)
        .attr("y2", (d: any) => (d.target as any).y);

      node.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });

    function dragStarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragEnded(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, showEmptyNodes]);

  return (
    <div className="relative w-full h-[600px] border mt-4 rounded-xl overflow-hidden">
      <button
        className="px-3 pt-1 bg-gray-200 rounded-lg mt-3.5 ml-2.5 hover:bg-gray-300 absolute"
        onClick={() => setShowEmptyNodes((prev) => !prev)}
      >
        {showEmptyNodes ? "Hide Empty Nodes" : "Show Empty Nodes"}
      </button>

      {tooltipWord && (
        <div
          className="max-w-3/4 absolute flex top-3.5 ml-2.5 right-4 z-10 bg-white p-4 border rounded-xl shadow-lg pointer-events-none"
        >
          <WordCard word={tooltipWord} />
        </div>
      )}
      <svg
        id="graph-svg"
        onMouseOver={() => tooltipWord && setTooltipWord(null)}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
