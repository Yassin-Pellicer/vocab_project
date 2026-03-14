import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import WordCard from "../word-card";
import { GraphLink, GraphNode } from "@/types/graph-types";
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
  word?: string;
  doubleView: boolean;
}

export default function DictionaryGraph({
  route,
  name,
  title,
  word,
  doubleView,
}: DictionaryGraphProps) {
  const navigate = useNavigate();
  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const doubleViewRef = useRef(doubleView);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { graphData, showEmptyNodes, setShowEmptyNodes } = useKnowledgeGraph(
    route,
    name,
    title,
    word,
  );

  const setSelectedWord = useConfigStore((s) => s.setSelectedWord);

  useEffect(() => {
    doubleViewRef.current = doubleView;
  }, [doubleView]);

  useEffect(() => {
    if (!graphData) return;

    const { nodes, links } = graphData;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgEl);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const container = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => {
        if (event.type === "wheel") {
          return (event as WheelEvent).ctrlKey;
        }
        return true;
      })
      .wheelDelta((event: WheelEvent) => -event.deltaY * 0.002)
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    const initialScale = 1;
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale)
        .translate(-width / 2, -height / 2),
    );

    const connectionCount = buildConnectionCount(links);

    const getNodeRadius = (d: GraphNode) =>
      calculateNodeRadius(connectionCount, d.id, Boolean(d.parent));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) =>
            (d.source as GraphNode).parent || (d.target as GraphNode).parent
              ? 100
              : 100,
          )
          .strength(1.2),
      )
      .force("charge", d3.forceManyBody().strength(0))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => getNodeRadius(d as GraphNode) + 5)
          .strength(1),
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .alpha(0.6)
      .alphaDecay(0.08)
      .alphaMin(0.02);

    const styles = getComputedStyle(document.documentElement);
    const strokeColor = (styles.getPropertyValue('--color-muted') || '#9ca3af').trim();
    const strokeOpacity = 0.6;
    const strokeWidth = 1.5;

    const link = container
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth);

    const node = container
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded),
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

    const nodeFill = (styles.getPropertyValue('--color-card') || '#d1d5db').trim();
    const nodeStroke = (styles.getPropertyValue('--color-border') || '#9ca3af').trim();

    node
      .append("circle")
      .attr("r", (d) => getNodeRadius(d))
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);

    const textFill = (styles.getPropertyValue('--color-muted-foreground') || '#6b7280').trim();

    node
      .append("text")
      .text((d) => d.label)
      .attr("dy", (d) => (d.parent ? 6 : -getNodeRadius(d) - 4))
      .attr("text-anchor", "middle")
      .attr("fill", textFill)
      .attr("font-size", "12px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      node.attr(
        "transform",
        (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`,
      );
    });

    simulation.on("end", () => {
      simulation.stop();
    });

    type DragEvent = d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>;

    function dragStarted(event: DragEvent) {
      if (!event.active) simulation.alphaTarget(0.15).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: DragEvent) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: DragEvent) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, navigate, route, name, setSelectedWord]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <button
        className="px-3 pt-1 bg-popover text-popover-foreground rounded-lg mt-3.5 ml-2.5 hover:opacity-90 absolute border border-border"
        onClick={() => setShowEmptyNodes((prev) => !prev)}
      >
        {showEmptyNodes ? "Hide Empty" : "Show All"}
      </button>

      {tooltipWord && (
        <div className="max-w-3/4 border rounded-xl absolute flex top-3.5 ml-2.5 right-4 z-10 bg-card p-4 shadow-lg pointer-events-none border-border text-card-foreground">
          <WordCard name={name} word={tooltipWord} />
        </div>
      )}

      <svg
        ref={svgRef}
        onMouseOver={() => tooltipWord && setTooltipWord(null)}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
