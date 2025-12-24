import { useEffect } from "react";
import * as d3 from "d3";

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  parent?: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export function useDictionaryGraph(
  svgRef: React.RefObject<SVGSVGElement>
) {
  useEffect(() => {
    if (!svgRef.current) return;

    const words = [
      "Weisheit","Wahrheit","Mut","Glück","Tod","Frieden","Schönheit","Hass",
      "Leben","Taschenrechner","Gerechtigkeit","Freude","Schwamm","Liebe",
      "Zeit","Wissen","Traum","Kugelschreiber","Freundschaft","Hoffnung",
      "Farbe","Schlafen","Baden","Pintar","Ayer","Ahnung","Artz","Ärtzin"
    ];

    const parentId = "dictionary-german";

    const nodes: GraphNode[] = [
      { id: parentId, label: "Dictionary (German)", parent: true },
      ...words.map(w => ({ id: w, label: w }))
    ];

    const links: GraphLink[] = words.map(w => ({
      source: parentId,
      target: w
    }));

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svg
      .attr("viewBox", [0, 0, width, height])
      .append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
        container.attr("transform", e.transform);
      })
    );

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.parent ? 40 : 24));

    const link = container.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", 1.2);

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    node.append("circle")
      .attr("r", d => d.parent ? 28 : 14)
      .attr("fill", d => d.parent ? "#ffb703" : "#4f83ff")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .text(d => d.label)
      .attr("dy", d => d.parent ? 6 : -18)
      .attr("text-anchor", "middle")
      .attr("fill", "#eaeaea")
      .attr("font-size", "12px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
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

    return () => simulation.stop();
  }, [svgRef]);
}
