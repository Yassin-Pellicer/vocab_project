import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { GraphLink, GraphNode } from "@/types/graph-types";
import { useNavigate } from "react-router-dom";
import { useKnowledgeGraph } from "./hook";
import EmblaCarousel from "../ui/embla/EmblaCarousel";
import WordCard from "../word-card";

const normalizeWord = (value: string) => value.trim().toLowerCase();

const nodeMatchesQuery = (node: GraphNode, query: string, exact = false) => {
  if (!query) return true;
  const normalized = normalizeWord(query);
  const label = node.label?.toLowerCase() ?? "";
  const labelMatch = exact ? label === normalized : label.includes(normalized);
  if (labelMatch) return true;
  const wordData = node.wordData;
  if (!wordData) return false;
  return wordData.pair.some((p) => {
    const original = p.original?.word?.toLowerCase() ?? "";
    if (exact ? original === normalized : original.includes(normalized)) return true;
    return (
      p.translations?.some((t) => {
        const translation = t.word?.toLowerCase() ?? "";
        return exact ? translation === normalized : translation.includes(normalized);
      }) ?? false
    );
  });
};

export default function DictionaryGraph({
  route,
  name,
  title,
  word,
  doubleView,
  showDirectToggle = true,
  directOnlyOverride,
  onDirectOnlyChange,
  showBottomSelector = true,
  autoSelectRandomWord = true,
  selectionScope = "global",
  initialWordId,
  navigateOnWordClick = false,
  onWordSelected,
  showGoBackButton = false,
  onSelectionCleared,
}: {
  route: string;
  name: string;
  title: string;
  word?: string;
  doubleView: boolean;
  showDirectToggle?: boolean;
  directOnlyOverride?: boolean;
  onDirectOnlyChange?: (value: boolean) => void;
  showBottomSelector?: boolean;
  autoSelectRandomWord?: boolean;
  selectionScope?: "global" | "local";
  initialWordId?: string;
  navigateOnWordClick?: boolean;
  onWordSelected?: (word: TranslationEntry) => void;
  showGoBackButton?: boolean;
  onSelectionCleared?: () => void;
}) {

  const navigate = useNavigate();
  const isDirectOnlyControlled = typeof directOnlyOverride === "boolean";

  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const [directOnly, setDirectOnly] = useState(directOnlyOverride ?? false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: GraphNode;
  } | null>(null);
  const [forceMenu, setForceMenu] = useState(false);
  const [localSelectedWord, setLocalSelectedWord] = useState<TranslationEntry | null>(null);

  const directOnlyValue = isDirectOnlyControlled
    ? (directOnlyOverride as boolean)
    : directOnly;

  const doubleViewRef = useRef(doubleView);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const graphContainerRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const lastTransformRef = useRef<d3.ZoomTransform | null>(null);
  const hasInitializedViewRef = useRef(false);
  const lastGraphKeyRef = useRef<string>("");
  const lastAnchorIdRef = useRef<string | null>(null);

  const setSelectedWordGlobal = DictionaryContext((s) => s.setSelectedWord);
  const selectedWordGlobal = DictionaryContext((s) => s.selectedWord);
  const searchField = DictionaryContext((s) => s.searchField);

  const selectedWord =
    selectionScope === "local" ? localSelectedWord : selectedWordGlobal;
  const selectedWordIdForFiltering =
    selectionScope === "local" ? localSelectedWord?.uuid : selectedWordGlobal?.uuid;
  const directOnlyForHook = selectionScope === "global" ? directOnlyValue : false;

  const { graphData } = useKnowledgeGraph(
    route,
    name,
    title,
    word,
    directOnlyForHook,
    selectedWordIdForFiltering,
  );

  const setSelectedWord = useCallback((next: TranslationEntry | null) => {
    if (selectionScope === "local") {
      setLocalSelectedWord((prev) => {
        if (prev?.uuid === next?.uuid) return prev;
        return next;
      });
    } else {
      setSelectedWordGlobal(next);
    }
    if (next) {
      onWordSelected?.(next);
    }
  }, [onWordSelected, selectionScope, setSelectedWordGlobal]);

  useEffect(() => {
    doubleViewRef.current = doubleView;
  }, [doubleView]);

  useEffect(() => {
    if (isDirectOnlyControlled) {
      setDirectOnly(directOnlyOverride as boolean);
    }
  }, [directOnlyOverride, isDirectOnlyControlled]);

  const menuQuery = useMemo(() => {
    if (typeof word === "string") return word.trim();
    return searchField.trim();
  }, [searchField, word]);

  const menuState = useMemo(() => {
    if (!graphData) {
      return {
        anchorId: null as string | null,
        menuItems: [] as {
          node: GraphNode;
          neighbors: string[];
        }[],
        menuQuery,
      };
    }

    const { nodes, links } = graphData;
    const connectedIds = new Set<string>();
    links.forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      connectedIds.add(sourceId);
      connectedIds.add(targetId);
    });

    const connectedNodes = nodes.filter(
      (node) => connectedIds.has(node.id) && !node.parent && node.wordData,
    );
    const allWordNodes = nodes.filter(
      (node) => !node.parent && node.wordData,
    );
    const menuSourceNodes = menuQuery ? allWordNodes : connectedNodes;
    const sortedMenuNodes = menuSourceNodes.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );

    const filteredMenuNodes = menuQuery
      ? sortedMenuNodes.filter((node) => nodeMatchesQuery(node, menuQuery))
      : sortedMenuNodes;

    let anchorId: string | null = null;
    if (selectedWord?.uuid) {
      anchorId = selectedWord.uuid;
    } else if (word && word.trim()) {
      const exactMatches = sortedMenuNodes.filter((node) =>
        nodeMatchesQuery(node, word, true),
      );
      if (exactMatches.length === 1) {
        anchorId = exactMatches[0].id;
      } else if (filteredMenuNodes.length === 1) {
        anchorId = filteredMenuNodes[0].id;
      }
    }

    if (anchorId && !nodes.some((node) => node.id === anchorId)) {
      anchorId = null;
    }

    const adjacency = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      if (sourceId === targetId) return;
      if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set());
      if (!adjacency.has(targetId)) adjacency.set(targetId, new Set());
      adjacency.get(sourceId)!.add(targetId);
      adjacency.get(targetId)!.add(sourceId);
    });

    const menuItems = filteredMenuNodes.map((node) => {
      const neighbors = Array.from(adjacency.get(node.id) ?? [])
        .filter((id) => id !== node.id);
      return { node, neighbors };
    });

    return {
      anchorId: forceMenu ? null : anchorId,
      menuItems,
      menuQuery,
    };
  }, [graphData, menuQuery, selectedWord?.uuid, word, forceMenu]);

  const showMenu = !menuState.anchorId;

  const connectedWordEntries = useMemo(() => {
    if (!graphData) return [];
    const { nodes, links } = graphData;
    const connectedIds = new Set<string>();
    links.forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      connectedIds.add(sourceId);
      connectedIds.add(targetId);
    });
    return nodes
      .filter((node) => connectedIds.has(node.id) && node.wordData)
      .map((node) => node.wordData!)
      .sort((a, b) =>
        (a.pair?.[0]?.original?.word ?? "").localeCompare(
          b.pair?.[0]?.original?.word ?? "",
          undefined,
          { sensitivity: "base" },
        ),
      );
  }, [graphData]);

  const allWordEntries = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes
      .filter((node) => !node.parent && node.wordData)
      .map((node) => node.wordData!)
      .sort((a, b) =>
        (a.pair?.[0]?.original?.word ?? "").localeCompare(
          b.pair?.[0]?.original?.word ?? "",
          undefined,
          { sensitivity: "base" },
        ),
      );
  }, [graphData]);

  const carouselEntries = useMemo(() => {
    const query = searchField.trim().toLowerCase();
    const source = query ? allWordEntries : connectedWordEntries;
    if (!query) return source;
    return source.filter((entry) =>
      entry.pair.some((p) => {
        const original = p.original?.word?.toLowerCase() ?? "";
        if (original.includes(query)) return true;
        return (
          p.translations?.some((t) =>
            (t.word?.toLowerCase() ?? "").includes(query),
          ) ?? false
        );
      }),
    );
  }, [allWordEntries, connectedWordEntries, searchField]);

  useEffect(() => {
    if (forceMenu) return;
    if (!initialWordId) return;
    if (connectedWordEntries.length === 0) return;
    if (selectedWord?.uuid === initialWordId) return;
    const entry = connectedWordEntries.find((item) => item.uuid === initialWordId);
    if (!entry) return;
    setSelectedWord(entry);
  }, [connectedWordEntries, forceMenu, initialWordId, selectedWord?.uuid, setSelectedWord]);

  useEffect(() => {
    if (!autoSelectRandomWord) return;
    if (selectedWord?.uuid) return;
    if (connectedWordEntries.length === 0) return;
    const randomIndex = Math.floor(Math.random() * connectedWordEntries.length);
    setSelectedWord(connectedWordEntries[randomIndex]);
  }, [autoSelectRandomWord, connectedWordEntries, selectedWord?.uuid, setSelectedWord]);

  useEffect(() => {
    if (showMenu) {
      setTooltipWord(null);
      setContextMenu(null);
    }
  }, [showMenu]);

  useEffect(() => {
    if (selectedWord?.uuid) {
      setForceMenu(false);
    }
  }, [selectedWord?.uuid]);

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
    const anchorId = menuState.anchorId;

    if (lastAnchorIdRef.current !== anchorId) {
      lastAnchorIdRef.current = anchorId;
      if (anchorId) {
        const currentScale = lastTransformRef.current?.k ?? 1;
        const centeredTransform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(currentScale);
        lastTransformRef.current = centeredTransform;
      }
    }

    if (zoom) {
      if (lastGraphKeyRef.current !== graphKey) {
        hasInitializedViewRef.current = false;
        lastGraphKeyRef.current = graphKey;
      }

      if (!hasInitializedViewRef.current) {
        const initialScale = 1;
        const initialTransform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(initialScale);
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
    const strokeOpacity = 0.6;
    const strokeWidth = 1.5;

    const linkKey = (d: GraphLink) => {
      const sourceId = typeof d.source === "string" ? d.source : d.source.id;
      const targetId = typeof d.target === "string" ? d.target : d.target.id;
      return `${sourceId}__${targetId}`;
    };

    if (!anchorId) {
      container.selectAll("line").remove();
      container.selectAll("g").remove();
      return;
    }

    const adjacency = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      if (sourceId === targetId) return;
      if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set());
      if (!adjacency.has(targetId)) adjacency.set(targetId, new Set());
      adjacency.get(sourceId)!.add(targetId);
      adjacency.get(targetId)!.add(sourceId);
    });

    const visited = new Set<string>();
    const levels = new Map<string, number>();
    const parentMap = new Map<string, string>();
    const queue: string[] = [];
    visited.add(anchorId);
    levels.set(anchorId, 0);
    queue.push(anchorId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = levels.get(currentId) ?? 0;
      if (directOnlyValue && currentLevel >= 1) continue;
      const neighbors = adjacency.get(currentId);
      if (!neighbors) continue;
      neighbors.forEach((neighborId) => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        levels.set(neighborId, currentLevel + 1);
        parentMap.set(neighborId, currentId);
        queue.push(neighborId);
      });
    }

    const visibleNodes = nodes.filter((node) => visited.has(node.id));
    const visibleLinks = links.filter((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      if (!visited.has(sourceId) || !visited.has(targetId)) {
        return false;
      }
      if (!directOnlyValue) {
        return true;
      }
      return sourceId === anchorId || targetId === anchorId;
    });

    const nodeRadiusById = new Map<string, number>();
    const fontSizeById = new Map<string, number>();
    const baseRadius = 26;
    const radiusDecay = 0.78;
    const minRadius = 6;
    const ringStep = Math.max(110, baseRadius * 4);
    const nodeById = new Map(visibleNodes.map((node) => [node.id, node]));

    visibleNodes.forEach((node) => {
      const level = levels.get(node.id) ?? 0;
      const nodeRadius = Math.max(minRadius, baseRadius * Math.pow(radiusDecay, level));
      nodeRadiusById.set(node.id, nodeRadius);
      fontSizeById.set(node.id, Math.max(9, 15 - level * 1.4));
    });

    const childrenByParent = new Map<string, string[]>();

    visibleNodes.forEach((node) => {
      if (node.id === anchorId) return;
      const parentId = parentMap.get(node.id) ?? anchorId;
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

      if (nodeId === anchorId) {
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

    layoutBranch(anchorId, 0, 0, FULL_CIRCLE);

    const linkSelection = container
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(visibleLinks, linkKey);

    linkSelection.exit().remove();

    const linkEnter = linkSelection
      .enter()
      .append("line")
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth);

    const link = linkEnter.merge(linkSelection);
    link
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-width", strokeWidth);

    const nodeSelection = container
      .selectAll<SVGGElement, GraphNode>("g")
      .data(visibleNodes, (d) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .on("mouseover", (_event, d) => {
        if (!d.wordData) return;
        setTooltipWord(d.wordData);
      })
      .on("click", (event, d) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (!d.wordData) return;
        if (!navigateOnWordClick) {
          setSelectedWord(d.wordData);
          setSelectedWordGlobal(d.wordData);
        }
        setContextMenu(null);
        if (navigateOnWordClick || !doubleViewRef.current) {
          navigate(
            `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}&uuid=${encodeURIComponent(d.wordData.uuid ?? "")}`,
          );
        }
      })
      .on("contextmenu", (event, d) => {
        event.preventDefault();
        if (!d.wordData) return;
        setSelectedWord(d.wordData);
        const bounds = containerRef.current?.getBoundingClientRect();
        if (!bounds) return;
        setContextMenu({
          x: Math.max(8, Math.min(event.clientX - bounds.left, bounds.width - 220)),
          y: Math.max(8, Math.min(event.clientY - bounds.top, bounds.height - 140)),
          node: d,
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
        if ((levels.get(d.id) ?? 0) === 0) return 0;
        const r = nodeRadiusById.get(d.id) ?? baseRadius;
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        const len = Math.hypot(x, y);
        if (!len) return 0;
        return (x / len) * (r + 12);
      })
      .attr("dy", (d) => {
        if ((levels.get(d.id) ?? 0) === 0) return 0;
        const r = nodeRadiusById.get(d.id) ?? baseRadius;
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        const len = Math.hypot(x, y);
        if (!len) return r + 14;
        return (y / len) * (r + 12);
      })
      .attr("opacity", 1);

    link.lower();
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

    node.attr(
      "transform",
      (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`,
    );
  }, [graphData, menuState.anchorId, directOnlyValue, navigate, route, name, setSelectedWord, setSelectedWordGlobal, navigateOnWordClick]);

  useEffect(() => {
    const handlePointer = () => setContextMenu(null);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("pointerdown", handlePointer);
    window.addEventListener("scroll", handlePointer, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("scroll", handlePointer, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      <div ref={topRef} className="relative w-full flex-1 min-h-0" style={{ flexBasis: "75%" }}>
        {tooltipWord && (
          <div className="max-w-3/4 border rounded-xl absolute flex top-3.5 ml-2.5 right-4 z-10 bg-card p-4 shadow-lg pointer-events-none border-border text-card-foreground">
            <WordCard name={name} word={tooltipWord} />
          </div>
        )}

        {showMenu && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <div className="w-[min(92%,520px)] rounded-2xl border border-border bg-card p-4 shadow-lg">
              <div className="text-sm font-semibold text-foreground">
                Explore connections
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Select a word to center the graph.
              </div>
              {menuState.menuItems.length === 0 ? (
                <div className="mt-4 text-sm text-muted-foreground">
                  {menuState.menuQuery
                    ? "No matching words found."
                    : "No related words found yet."}
                </div>
              ) : (
                <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-border/60 bg-background">
                  {menuState.menuItems.map(({ node, neighbors }) => {
                    const previewNeighbors = neighbors.slice(0, 8);
                    const previewCount = previewNeighbors.length;
                    const previewRadius = 22;
                    return (
                      <button
                        key={`graph-menu-${node.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/40"
                        onClick={() => {
                          if (!node.wordData) return;
                          setForceMenu(false);
                          setSelectedWord(node.wordData);
                          setSelectedWordGlobal(node.wordData);
                          setContextMenu(null);
                          if (navigateOnWordClick || !doubleViewRef.current) {
                            navigate(
                              `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}&uuid=${encodeURIComponent(node.wordData.uuid ?? "")}`,
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            width={60}
                            height={60}
                            viewBox="0 0 60 60"
                            aria-hidden="true"
                            className="shrink-0"
                          >
                            <circle cx={30} cy={30} r={6} fill="currentColor" opacity={0.7} />
                            {previewNeighbors.map((_, index) => {
                              const angle = (index / Math.max(1, previewCount)) * Math.PI * 2;
                              const x = 30 + Math.cos(angle) * previewRadius;
                              const y = 30 + Math.sin(angle) * previewRadius;
                              return (
                                <circle
                                  key={`${node.id}-preview-${index}`}
                                  cx={x}
                                  cy={y}
                                  r={4}
                                  fill="currentColor"
                                  opacity={0.35}
                                />
                              );
                            })}
                          </svg>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {node.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {neighbors.length} connections
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {contextMenu && (
          <div
            className="absolute z-20 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              {contextMenu.node.label}
            </div>
            <button className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-muted/40">
              Open word
            </button>
            <button className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-muted/40">
              Add to notes
            </button>
            <button className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-muted/40">
              Inspect connections
            </button>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end z-10">
          {showDirectToggle && (
            <button
              className="px-3 h-fit bg-popover text-popover-foreground rounded-lg hover:opacity-90 border border-border"
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
        </div>

        {!showMenu && showGoBackButton && (
          <div className="absolute top-4 left-4 z-10">
            <button
              className="px-3 h-fit bg-popover text-popover-foreground rounded-lg hover:opacity-90 border border-border"
              onClick={() => {
                setForceMenu(true);
                setSelectedWord(null);
                onSelectionCleared?.();
                setContextMenu(null);
                setTooltipWord(null);
              }}
            >
              Go back
            </button>
          </div>
        )}

        <svg
          ref={svgRef}
          onMouseOver={() => tooltipWord && setTooltipWord(null)}
          onClick={() => setContextMenu(null)}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>

      {showBottomSelector && (
        <div className="relative w-full border-t border-border/60 bg-background/70 px-3 py-3 h-fit" style={{ flexBasis: "25%" }}>
          {carouselEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6">
              {searchField.trim() !== "" ? "No matching words found." : "No connected words yet."}
            </div>
          ) : (
            <EmblaCarousel
              slides={carouselEntries}
              options={{ dragFree: true, align: "start" }}
              getSlideKey={(entry) => entry.uuid}
              slideClassName="basis-[300px] min-w-0 shrink-0 pr-3 flex"
              renderSlide={(entry) => (
                <div
                  className="h-[190px] w-full rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden"
                  onClick={() => setSelectedWord(entry)}
                >
                  <WordCard name={name} word={entry} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
