import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import WordCard from "../word-card";
import { GraphNode } from "@/types/graph-types";
import { useNavigate } from "react-router-dom";
import {
  useKnowledgeGraph,
  calculateNodeRadius,
  buildConnectionCount,
} from "./hook";

interface DictionaryGraphProps {
  route: string;
  name: string;
  title: string;
  doubleView: boolean;
}

export default function DictionaryGraph({
  route,
  name,
  title,
  doubleView,
}: DictionaryGraphProps) {
  const navigate = useNavigate();
  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const doubleViewRef = useRef(doubleView);

  const { graphData, showEmptyNodes, setShowEmptyNodes } = useKnowledgeGraph(
    route,
    name,
    title,
  );

  const setSelectedWord = useConfigStore((s) => s.setSelectedWord);

  useEffect(() => {
    doubleViewRef.current = doubleView;
  }, [doubleView]);

  useEffect(() => {
    if (!graphData) return;

    const { nodes, links } = graphData;
    const width = window.innerWidth;
    const height = window.innerHeight;

    d3.select("#graph-svg").selectAll("*").remove();

    const svg = d3.select("#graph-svg").attr("viewBox", [0, 0, width, height]);
    const container = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => {
        if (event.type === "wheel") {
          return event.ctrlKey;
        }
        return true;
      })
      .wheelDelta((event: any) => -event.deltaY * 0.002)
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const initialScale = 3;
    svg.call(
      zoom.transform as any,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale)
        .translate(-width / 2, -height / 2),
    );

    const connectionCount = buildConnectionCount(links);

    const getNodeRadius = (d: any) =>
      calculateNodeRadius(connectionCount, d.id, d.parent);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) =>
            (d.source as any).parent || (d.target as any).parent ? 100 : 100,
          )
          .strength(1.2),
      )
      .force("charge", d3.forceManyBody().strength(0))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d: any) => getNodeRadius(d) + 5)
          .strength(1),
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .alpha(0.6)
      .alphaDecay(0.08)
      .alphaMin(0.02);

    const link = container
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#9ca3af")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5);

    const node = container
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded) as any,
      )
      .on("mouseover", (_event, d) => {
        if (!d.wordData) return;
        setTooltipWord(d.wordData);
      })
      .on("click", (_event, d) => {
        if (!d.wordData) return;
        setSelectedWord(d.wordData);
        if (!doubleViewRef.current) {
          navigate(
            `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}`,
          );
        }
      });

    node
      .append("circle")
      .attr("r", (d: any) => getNodeRadius(d))
      .attr("fill", "#d1d5db")
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d: any) => d.label)
      .attr("dy", (d: any) => (d.parent ? 6 : -getNodeRadius(d) - 4))
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

    simulation.on("end", () => {
      simulation.stop();
    });

    function dragStarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.15).restart();
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
  }, [graphData, navigate, route, name, setSelectedWord]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <button
        className="px-3 pt-1 bg-gray-200 rounded-lg mt-3.5 ml-2.5 hover:bg-gray-300 absolute z-10"
        onClick={() => setShowEmptyNodes((prev) => !prev)}
      >
        {showEmptyNodes ? "Hide Empty" : "Show All"}
      </button>

      {tooltipWord && (
        <div className="max-w-3/4 border rounded-xl absolute flex top-3.5 ml-2.5 right-4 z-10 bg-white p-4 shadow-lg pointer-events-none">
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
