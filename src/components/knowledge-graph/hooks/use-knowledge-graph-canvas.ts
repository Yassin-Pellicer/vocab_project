import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { NavigateFunction } from "react-router-dom";
import type { GraphLink, GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";
import type { ContextMenuState, EdgeSelection, GraphData } from "../types";
import { getEdgeKey, getLinkNodeId } from "../utils";

type UseKnowledgeGraphCanvasParams = {
  graphData: GraphData | null;
  menuAnchorId: string | null;
  directOnlyValue: boolean;
  route: string;
  name: string;
  navigate: NavigateFunction;
  navigateOnWordClick: boolean;
  doubleView: boolean;
  selectedEdge: EdgeSelection | null;
  isSavingLink: boolean;
  onNodeHover: (word: TranslationEntry | null) => void;
  onNodeActivate: (word: TranslationEntry) => void;
  onNodeContextMenu: (contextMenu: ContextMenuState) => void;
  onCloseContextMenu: () => void;
  onClearLinkModal: () => void;
  onEdgeSelect: (edge: EdgeSelection) => void;
};

export function useKnowledgeGraphCanvas({
  graphData,
  menuAnchorId,
  directOnlyValue,
  route,
  name,
  navigate,
  navigateOnWordClick,
  doubleView,
  selectedEdge,
  isSavingLink,
  onNodeHover,
  onNodeActivate,
  onNodeContextMenu,
  onCloseContextMenu,
  onClearLinkModal,
  onEdgeSelect,
}: UseKnowledgeGraphCanvasParams) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const graphContainerRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const lastTransformRef = useRef<d3.ZoomTransform | null>(null);
  const hasInitializedViewRef = useRef(false);
  const lastGraphKeyRef = useRef<string>("");
  const lastAnchorIdRef = useRef<string | null>(null);
  const doubleViewRef = useRef(doubleView);

  useEffect(() => {
    doubleViewRef.current = doubleView;
  }, [doubleView]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    if (graphContainerRef.current) return;

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
      .clickDistance(8)
      .wheelDelta((event: WheelEvent) => -event.deltaY * 0.002)
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        lastTransformRef.current = event.transform;
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    return () => {
      graphContainerRef.current = null;
      zoomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!graphData) return;

    const { nodes, links } = graphData;
    const svgEl = svgRef.current;
    const container = graphContainerRef.current;
    if (!svgEl || !container) return;

    const width = topRef.current?.clientWidth || containerRef.current?.clientWidth || 800;
    const height = topRef.current?.clientHeight || containerRef.current?.clientHeight || 600;

    const svg = d3.select<SVGSVGElement, unknown>(svgEl);
    const zoom = zoomRef.current;
    const graphKey = `${route}::${name}`;
    const anchorId = menuAnchorId;

    if (lastAnchorIdRef.current !== anchorId) {
      lastAnchorIdRef.current = anchorId;
      if (anchorId) {
        const currentScale = lastTransformRef.current?.k ?? 1;
        lastTransformRef.current = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(currentScale);
      }
    }

    if (zoom) {
      if (lastGraphKeyRef.current !== graphKey) {
        hasInitializedViewRef.current = false;
        lastGraphKeyRef.current = graphKey;
      }

      if (!hasInitializedViewRef.current) {
        const initialTransform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1);
        svg.call(zoom.transform, initialTransform);
        lastTransformRef.current = initialTransform;
        hasInitializedViewRef.current = true;
      } else if (lastTransformRef.current) {
        svg.call(zoom.transform, lastTransformRef.current);
      }
    }

    const styles = getComputedStyle(document.documentElement);
    const strokeColor = (styles.getPropertyValue("--color-muted") || "#9ca3af").trim();
    const nodeFill = (styles.getPropertyValue("--color-card") || "#d1d5db").trim();
    const nodeStroke = (styles.getPropertyValue("--color-border") || "#9ca3af").trim();
    const textFill = (styles.getPropertyValue("--color-muted-foreground") || "#6b7280").trim();
    const selectedEdgeColor = (styles.getPropertyValue("--color-destructive") || "#ef4444").trim();
    const strokeOpacity = 0.6;
    const strokeWidth = 1.5;
    const selectedEdgeKey = selectedEdge
      ? getEdgeKey(selectedEdge.sourceId, selectedEdge.targetId)
      : null;

    const linkKey = (link: GraphLink) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      return getEdgeKey(sourceId, targetId);
    };

    if (!anchorId) {
      container.selectAll("line").remove();
      container.selectAll("g").remove();
      return;
    }

    const adjacency = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (sourceId === targetId) return;
      if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set<string>());
      if (!adjacency.has(targetId)) adjacency.set(targetId, new Set<string>());
      adjacency.get(sourceId)!.add(targetId);
      adjacency.get(targetId)!.add(sourceId);
    });

    const visited = new Set<string>();
    const traversalLevels = new Map<string, number>();
    const queue: string[] = [];
    visited.add(anchorId);
    traversalLevels.set(anchorId, 0);
    queue.push(anchorId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = traversalLevels.get(currentId) ?? 0;
      if (directOnlyValue && currentLevel >= 1) continue;

      const neighbors = adjacency.get(currentId);
      if (!neighbors) continue;
      neighbors.forEach((neighborId) => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        traversalLevels.set(neighborId, currentLevel + 1);
        queue.push(neighborId);
      });
    }

    const visibleNodes = nodes.filter((node) => visited.has(node.id));
    const visibleLinks = links.filter((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (!visited.has(sourceId) || !visited.has(targetId)) return false;
      if (!directOnlyValue) return true;
      return sourceId === anchorId || targetId === anchorId;
    });

    const nodeRadiusById = new Map<string, number>();
    const fontSizeById = new Map<string, number>();
    const baseRadius = 26;
    const radiusDecay = 0.78;
    const minRadius = 6;
    const ringStep = Math.max(110, baseRadius * 4);
    const nodeById = new Map(visibleNodes.map((node) => [node.id, node]));
    const sortNodeIds = (leftId: string, rightId: string) => {
      const leftLabel = nodeById.get(leftId)?.label ?? leftId;
      const rightLabel = nodeById.get(rightId)?.label ?? rightId;
      const labelCompare = leftLabel.localeCompare(rightLabel, undefined, {
        sensitivity: "base",
      });
      if (labelCompare !== 0) return labelCompare;
      return leftId.localeCompare(rightId, undefined, { sensitivity: "base" });
    };
    const layoutAdjacency = new Map<string, Set<string>>();
    visibleLinks.forEach((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (sourceId === targetId) return;
      if (!layoutAdjacency.has(sourceId)) layoutAdjacency.set(sourceId, new Set<string>());
      if (!layoutAdjacency.has(targetId)) layoutAdjacency.set(targetId, new Set<string>());
      layoutAdjacency.get(sourceId)!.add(targetId);
      layoutAdjacency.get(targetId)!.add(sourceId);
    });
    const layoutRootId = [...visibleNodes]
      .map((node) => node.id)
      .sort((leftId, rightId) => {
        const leftDegree = layoutAdjacency.get(leftId)?.size ?? 0;
        const rightDegree = layoutAdjacency.get(rightId)?.size ?? 0;
        if (leftDegree !== rightDegree) return rightDegree - leftDegree;
        return sortNodeIds(leftId, rightId);
      })[0] ?? anchorId;
    const layoutLevels = new Map<string, number>();
    const layoutParentMap = new Map<string, string>();
    const layoutVisited = new Set<string>([layoutRootId]);
    const layoutQueue: string[] = [layoutRootId];
    layoutLevels.set(layoutRootId, 0);

    while (layoutQueue.length > 0) {
      const currentId = layoutQueue.shift()!;
      const currentLevel = layoutLevels.get(currentId) ?? 0;
      const neighbors = [...(layoutAdjacency.get(currentId) ?? [])].sort(sortNodeIds);
      neighbors.forEach((neighborId) => {
        if (layoutVisited.has(neighborId)) return;
        layoutVisited.add(neighborId);
        layoutLevels.set(neighborId, currentLevel + 1);
        layoutParentMap.set(neighborId, currentId);
        layoutQueue.push(neighborId);
      });
    }

    visibleNodes.forEach((node) => {
      const level = layoutLevels.get(node.id) ?? 0;
      const nodeRadius = Math.max(minRadius, baseRadius * Math.pow(radiusDecay, level));
      nodeRadiusById.set(node.id, nodeRadius);
      fontSizeById.set(node.id, Math.max(9, 15 - level * 1.4));
    });

    const childrenByParent = new Map<string, string[]>();
    visibleNodes.forEach((node) => {
      if (node.id === layoutRootId) return;
      const parentId = layoutParentMap.get(node.id) ?? layoutRootId;
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, []);
      }
      childrenByParent.get(parentId)!.push(node.id);
    });

    childrenByParent.forEach((childIds) => {
      childIds.sort((a, b) => {
        const labelA = nodeById.get(a)?.label ?? a;
        const labelB = nodeById.get(b)?.label ?? b;
        return labelA.localeCompare(labelB, undefined, { sensitivity: "base" });
      });
    });

    const FULL_CIRCLE = Math.PI * 2;
    const ROOT_SPAN = (Math.PI * 3) / 2;
    const CHILD_SECTOR_FILL = 0.86;
    const ROOT_START_ANGLE = -Math.PI / 2;

    const placeNode = (nodeId: string, angle: number, level: number) => {
      const graphNode = nodeById.get(nodeId);
      if (!graphNode) return;
      if (level === 0) {
        graphNode.x = 0;
        graphNode.y = 0;
        return;
      }

      const radius = level * ringStep;
      graphNode.x = Math.cos(angle) * radius;
      graphNode.y = Math.sin(angle) * radius;
    };

    const layoutBranch = (
      nodeId: string,
      level: number,
      centerAngle: number,
      availableSpan: number,
    ) => {
      placeNode(nodeId, centerAngle, level);

      const children = childrenByParent.get(nodeId) ?? [];
      if (children.length === 0) return;

      if (nodeId === layoutRootId) {
        const childSpan = ROOT_SPAN / children.length;
        children.forEach((childId, index) => {
          const childAngle = ROOT_START_ANGLE + index * childSpan;
          layoutBranch(childId, level + 1, childAngle, childSpan);
        });
        return;
      }

      if (children.length === 1) {
        layoutBranch(children[0], level + 1, centerAngle, availableSpan * CHILD_SECTOR_FILL);
        return;
      }

      const usableSpan = availableSpan * CHILD_SECTOR_FILL;
      const childSpan = usableSpan / children.length;
      const startAngle = centerAngle - usableSpan / 2 + childSpan / 2;

      children.forEach((childId, index) => {
        const childAngle = startAngle + index * childSpan;
        layoutBranch(childId, level + 1, childAngle, childSpan);
      });
    };

    layoutBranch(layoutRootId, 0, 0, FULL_CIRCLE);

    const selectedAnchorNode = nodeById.get(anchorId);
    const anchorOffsetX = selectedAnchorNode?.x ?? 0;
    const anchorOffsetY = selectedAnchorNode?.y ?? 0;
    if (anchorOffsetX !== 0 || anchorOffsetY !== 0) {
      visibleNodes.forEach((node) => {
        node.x = (node.x ?? 0) - anchorOffsetX;
        node.y = (node.y ?? 0) - anchorOffsetY;
      });
    }

    const handleEdgeSelection = (link: GraphLink) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);
      if (!sourceId || !targetId || sourceId === targetId) return;

      const sourceNode = nodeById.get(sourceId);
      const targetNode = nodeById.get(targetId);

      onCloseContextMenu();
      onNodeHover(null);
      if (!isSavingLink) {
        onClearLinkModal();
      }
      onEdgeSelect({
        sourceId,
        targetId,
        sourceLabel: sourceNode?.label ?? sourceId,
        targetLabel: targetNode?.label ?? targetId,
      });
    };

    const linkSelection = container
      .selectAll<SVGLineElement, GraphLink>("line.graph-link")
      .data(visibleLinks, linkKey);

    linkSelection.exit().remove();

    const linkEnter = linkSelection
      .enter()
      .append("line")
      .classed("graph-link", true)
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth);

    const link = linkEnter.merge(linkSelection);
    let hoveredEdgeKey: string | null = null;
    const applyLinkStyles = () => {
      link
        .style("pointer-events", "none")
        .attr("stroke", (d) => {
          const sourceId = getLinkNodeId(d.source);
          const targetId = getLinkNodeId(d.target);
          const edgeKey = getEdgeKey(sourceId, targetId);
          return edgeKey === selectedEdgeKey || edgeKey === hoveredEdgeKey
            ? selectedEdgeColor
            : strokeColor;
        })
        .attr("stroke-opacity", (d) => {
          const sourceId = getLinkNodeId(d.source);
          const targetId = getLinkNodeId(d.target);
          const edgeKey = getEdgeKey(sourceId, targetId);
          return edgeKey === selectedEdgeKey || edgeKey === hoveredEdgeKey ? 1 : strokeOpacity;
        })
        .attr("stroke-width", (d) => {
          const sourceId = getLinkNodeId(d.source);
          const targetId = getLinkNodeId(d.target);
          const edgeKey = getEdgeKey(sourceId, targetId);
          return edgeKey === selectedEdgeKey || edgeKey === hoveredEdgeKey
            ? strokeWidth + 1.25
            : strokeWidth;
        });
    };

    applyLinkStyles();

    const linkHitSelection = container
      .selectAll<SVGLineElement, GraphLink>("line.graph-link-hit")
      .data(visibleLinks, linkKey);

    linkHitSelection.exit().remove();

    const linkHitEnter = linkHitSelection
      .enter()
      .append("line")
      .classed("graph-link-hit", true)
      .attr("stroke", "transparent")
      .attr("stroke-opacity", 0)
      .attr("stroke-linecap", "round")
      .attr("stroke-width", Math.max(10, strokeWidth + 8));

    const linkHit = linkHitEnter
      .merge(linkHitSelection)
      .style("cursor", "pointer")
      .style("pointer-events", "stroke")
      .on("pointerdown", (event) => {
        event.stopPropagation();
      })
      .on("mouseenter", (_event, linkDatum) => {
        hoveredEdgeKey = linkKey(linkDatum);
        applyLinkStyles();
      })
      .on("mouseleave", () => {
        hoveredEdgeKey = null;
        applyLinkStyles();
      })
      .on("click", (event, linkDatum) => {
        if (event.defaultPrevented || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        handleEdgeSelection(linkDatum);
      });

    const nodeSelection = container
      .selectAll<SVGGElement, GraphNode>("g")
      .data(visibleNodes, (node) => node.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("pointerdown", (event) => {
        event.stopPropagation();
      })
      .on("mouseover", (_event, node) => {
        if (!node.wordData) return;
        onNodeHover(node.wordData);
      })
      .on("click", (event, node) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (!node.wordData) return;

        onNodeActivate(node.wordData);
        onCloseContextMenu();

        if (navigateOnWordClick || !doubleViewRef.current) {
          navigate(
            `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}&uuid=${encodeURIComponent(node.wordData.uuid ?? "")}`,
          );
        }
      })
      .on("contextmenu", (event, node) => {
        event.preventDefault();
        if (!node.wordData) return;

        const bounds = containerRef.current?.getBoundingClientRect();
        if (!bounds) return;

        onNodeContextMenu({
          x: Math.max(8, Math.min(event.clientX - bounds.left, bounds.width - 220)),
          y: Math.max(8, Math.min(event.clientY - bounds.top, bounds.height - 140)),
          node,
        });
      });

    nodeEnter
      .append("circle")
      .attr("fill", nodeFill)
      .attr("stroke-width", 2);

    nodeEnter
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", textFill)
      .style("pointer-events", "none");

    const node = nodeEnter.merge(nodeSelection);

    node.select<SVGCircleElement>("circle")
      .attr("fill", nodeFill)
      .attr("r", (d) => nodeRadiusById.get(d.id) ?? baseRadius)
      .attr("stroke", nodeStroke)
      .attr("stroke-opacity", 1);

    node
      .select<SVGTextElement>("text")
      .text((d) => d.label)
      .attr("font-size", (d) => `${fontSizeById.get(d.id) ?? 12}px`)
      .attr("dx", (d) => {
        if ((layoutLevels.get(d.id) ?? 0) === 0) return 0;
        const radius = nodeRadiusById.get(d.id) ?? baseRadius;
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        const len = Math.hypot(x, y);
        if (!len) return 0;
        return (x / len) * (radius + 12);
      })
      .attr("dy", (d) => {
        if ((layoutLevels.get(d.id) ?? 0) === 0) return 0;
        const radius = nodeRadiusById.get(d.id) ?? baseRadius;
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        const len = Math.hypot(x, y);
        if (!len) return radius + 14;
        return (y / len) * (radius + 12);
      })
      .attr("opacity", 1);

    link.lower();
    linkHit.lower();
    node.raise();

    link
      .attr("x1", (d) => {
        const source = typeof d.source === "string" ? nodeById.get(d.source) : d.source;
        return source?.x ?? 0;
      })
      .attr("y1", (d) => {
        const source = typeof d.source === "string" ? nodeById.get(d.source) : d.source;
        return source?.y ?? 0;
      })
      .attr("x2", (d) => {
        const target = typeof d.target === "string" ? nodeById.get(d.target) : d.target;
        return target?.x ?? 0;
      })
      .attr("y2", (d) => {
        const target = typeof d.target === "string" ? nodeById.get(d.target) : d.target;
        return target?.y ?? 0;
      });

    linkHit
      .attr("x1", (d) => {
        const source = typeof d.source === "string" ? nodeById.get(d.source) : d.source;
        return source?.x ?? 0;
      })
      .attr("y1", (d) => {
        const source = typeof d.source === "string" ? nodeById.get(d.source) : d.source;
        return source?.y ?? 0;
      })
      .attr("x2", (d) => {
        const target = typeof d.target === "string" ? nodeById.get(d.target) : d.target;
        return target?.x ?? 0;
      })
      .attr("y2", (d) => {
        const target = typeof d.target === "string" ? nodeById.get(d.target) : d.target;
        return target?.y ?? 0;
      });

    node.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
  }, [
    graphData,
    menuAnchorId,
    directOnlyValue,
    route,
    name,
    navigate,
    navigateOnWordClick,
    selectedEdge,
    isSavingLink,
    onNodeHover,
    onNodeActivate,
    onNodeContextMenu,
    onCloseContextMenu,
    onClearLinkModal,
    onEdgeSelect,
  ]);

  return {
    svgRef,
    containerRef,
    topRef,
  };
}
