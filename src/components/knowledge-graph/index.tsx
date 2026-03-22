import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { GraphLink, GraphNode } from "@/types/graph-types";
import { useNavigate } from "react-router-dom";
import {
  useKnowledgeGraph,
  calculateNodeRadius,
  buildConnectionCount,
} from "./hook";

import WordCard from "../word-card";

export default function DictionaryGraph({
  route,
  name,
  title,
  word,
  doubleView,
  showDirectToggle = true,
  directOnlyOverride,
  onDirectOnlyChange,
}: {
  route: string;
  name: string;
  title: string;
  word?: string;
  doubleView: boolean;
  showDirectToggle?: boolean;
  directOnlyOverride?: boolean;
  onDirectOnlyChange?: (value: boolean) => void;
}) {

  const navigate = useNavigate();
  const isDirectOnlyControlled = typeof directOnlyOverride === "boolean";

  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const [directOnly, setDirectOnly] = useState(directOnlyOverride ?? false);

  const directOnlyValue = isDirectOnlyControlled
    ? (directOnlyOverride as boolean)
    : directOnly;

  const doubleViewRef = useRef(doubleView);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const graphContainerRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
  const lastTransformRef = useRef<d3.ZoomTransform | null>(null);
  const hasInitializedViewRef = useRef(false);
  const lastGraphKeyRef = useRef<string>("");

  const { graphData } = useKnowledgeGraph(
    route,
    name,
    title,
    word,
    directOnlyValue,
  );

  const setSelectedWord = DictionaryContext((s) => s.setSelectedWord);

  useEffect(() => {
    doubleViewRef.current = doubleView;
  }, [doubleView]);

  useEffect(() => {
    if (isDirectOnlyControlled) {
      setDirectOnly(directOnlyOverride as boolean);
    }
  }, [directOnlyOverride, isDirectOnlyControlled]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    if (graphContainerRef.current && simulationRef.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgEl);

    const container = svg.append("g");
    graphContainerRef.current = container;

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
        lastTransformRef.current = event.transform;
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    const simulation = d3
      .forceSimulation<GraphNode>()
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>().id((d) => d.id),
      )
      .force("charge", d3.forceManyBody().strength(0))
      .force("collision", d3.forceCollide().strength(1))
      .force("center", d3.forceCenter(0, 0).strength(0.05))
      .alphaDecay(0.08)
      .alphaMin(0.02);

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
      graphContainerRef.current = null;
      zoomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!graphData) return;

    const { nodes, links } = graphData;
    const svgEl = svgRef.current;
    const container = graphContainerRef.current;
    const simulation = simulationRef.current;
    if (!svgEl || !container || !simulation) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select<SVGSVGElement, unknown>(svgEl);
    const zoom = zoomRef.current;
    const graphKey = `${route}::${name}`;
    if (zoom) {
      if (lastGraphKeyRef.current !== graphKey) {
        hasInitializedViewRef.current = false;
        lastGraphKeyRef.current = graphKey;
      }

      if (!hasInitializedViewRef.current) {
        const initialScale = 1;
        const initialTransform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(initialScale)
          .translate(-width / 2, -height / 2);
        svg.call(zoom.transform, initialTransform);
        lastTransformRef.current = initialTransform;
        hasInitializedViewRef.current = true;
      } else if (lastTransformRef.current) {
        svg.call(zoom.transform, lastTransformRef.current);
      }
    }

    const connectionCount = buildConnectionCount(links);

    const getNodeRadius = (d: GraphNode) =>
      calculateNodeRadius(connectionCount, d.id, Boolean(d.parent));

    const styles = getComputedStyle(document.documentElement);
    const strokeColor = (styles.getPropertyValue("--color-muted") || "#9ca3af").trim();
    const nodeFill = (styles.getPropertyValue("--color-card") || "#d1d5db").trim();
    const nodeStroke = (styles.getPropertyValue("--color-border") || "#9ca3af").trim();
    const textFill = (styles.getPropertyValue("--color-muted-foreground") || "#6b7280").trim();
    const strokeOpacity = 0.6;
    const strokeWidth = 1.5;

    const linkKey = (d: GraphLink) => {
      const sourceId = typeof d.source === "string" ? d.source : d.source.id;
      const targetId = typeof d.target === "string" ? d.target : d.target.id;
      return `${sourceId}__${targetId}`;
    };

    const linkSelection = container
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links, linkKey);

    linkSelection.exit().remove();

    const linkEnter = linkSelection
      .enter()
      .append("line")
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth);

    const link = linkEnter.merge(linkSelection);

    const nodeSelection = container
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes, (d) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .filter((event) => event.button !== 2)
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded),
      )
      .on("mouseover", (_event, d) => {
        if (!d.wordData) return;
        setTooltipWord(d.wordData);
      })
      .on("click", (event, d) => {
        if (event.button !== 2) return;
        if (!d.wordData) return;
        setSelectedWord(d.wordData);
        if (!doubleViewRef.current) {
          navigate(
            `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}`,
          );
        }
      })
      .on("contextmenu", (event, d) => {
        event.preventDefault();
        if (!d.wordData) return;
        setSelectedWord(d.wordData);
        if (!doubleViewRef.current) {
          navigate(
            `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}`,
          );
        }
      });

    nodeEnter
      .append("circle")
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);

    nodeEnter
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", textFill)
      .attr("font-size", "12px")
      .style("pointer-events", "none");

    const node = nodeEnter.merge(nodeSelection);

    node.select<SVGCircleElement>("circle").attr("r", (d) => getNodeRadius(d));
    node
      .select<SVGTextElement>("text")
      .text((d) => d.label)
      .attr("dy", (d) => (d.parent ? 6 : -getNodeRadius(d) - 4));

    link.lower();
    node.raise();

    simulation
      .nodes(nodes)
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
      .force(
        "collision",
        d3
          .forceCollide<GraphNode>()
          .radius((d) => getNodeRadius(d) + 5)
          .strength(1),
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .alpha(0.6)
      .restart();

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

    type DragEvent = d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>;

    function dragStarted(event: DragEvent) {
      if (!event.active) simulation!.alphaTarget(0.15).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: DragEvent) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: DragEvent) {
      if (!event.active) simulation!.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [graphData, navigate, route, name, setSelectedWord]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {tooltipWord && (
        <div className="max-w-3/4 border rounded-xl absolute flex top-3.5 ml-2.5 right-4 z-10 bg-card p-4 shadow-lg pointer-events-none border-border text-card-foreground">
          <WordCard name={name} word={tooltipWord} />
        </div>
      )}

      {showDirectToggle && (
        <button
          className="px-3 h-fit bg-popover text-popover-foreground rounded-lg right-4 top-4 hover:opacity-90 absolute border border-border"
          onClick={() => {
            if (isDirectOnlyControlled) {
              onDirectOnlyChange?.(!directOnlyValue);
            } else {
              setDirectOnly((prev) => !prev);
            }
          }}
        >
          {directOnlyValue ? "All Relations" : "Direct Relations"}
        </button>
      )}

      <svg
        ref={svgRef}
        onMouseOver={() => tooltipWord && setTooltipWord(null)}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}
