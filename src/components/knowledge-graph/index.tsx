import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DictionaryContext } from "@/context/dictionary-context";
import type { GraphNode } from "@/types/graph-types";
import type { TranslationEntry } from "@/types/translation-entry";
import EmblaCarousel from "../ui/embla/EmblaCarousel";
import WordCard from "../word-card";
import { useKnowledgeGraph } from "./hook";
import { DeleteConnectionModal } from "./components/delete-connection-modal";
import { ExploreMenuOverlay } from "./components/explore-menu-overlay";
import { LinkWordModal } from "./components/link-word-modal";
import { NodeContextMenu } from "./components/node-context-menu";
import { useEdgeDeletion } from "./hooks/use-edge-deletion";
import { useGraphDerivedData } from "./hooks/use-graph-derived-data";
import { useKnowledgeGraphCanvas } from "./hooks/use-knowledge-graph-canvas";
import { useLinkWordModal } from "./hooks/use-link-word-modal";
import type { ContextMenuState, DictionaryGraphProps } from "./types";

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
}: DictionaryGraphProps) {
  const navigate = useNavigate();
  const isDirectOnlyControlled = typeof directOnlyOverride === "boolean";

  const [tooltipWord, setTooltipWord] = useState<TranslationEntry | null>(null);
  const [directOnly, setDirectOnly] = useState(directOnlyOverride ?? false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [forceMenu, setForceMenu] = useState(false);
  const [localSelectedWord, setLocalSelectedWord] = useState<TranslationEntry | null>(null);
  const hasHadSelectionRef = useRef(false);

  const directOnlyValue = isDirectOnlyControlled
    ? (directOnlyOverride as boolean)
    : directOnly;

  const setSelectedWordGlobal = DictionaryContext((s) => s.setSelectedWord);
  const selectedWordGlobal = DictionaryContext((s) => s.selectedWordByDict[name] ?? null);
  const searchField = DictionaryContext((s) => s.searchField);
  const dictionaries = DictionaryContext((s) => s.dictionaries);

  const selectedWord = selectionScope === "local" ? localSelectedWord : selectedWordGlobal;
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
      setSelectedWordGlobal(name, next);
    }

    if (next) {
      onWordSelected?.(next);
    }
  }, [onWordSelected, selectionScope, setSelectedWordGlobal]);

  const {
    linkSourceNode,
    linkSearchValue,
    setLinkSearchValue,
    isSavingLink,
    openLinkModal,
    closeLinkModal,
    clearLinkModal,
    handleLinkWord,
  } = useLinkWordModal({
    route,
    name,
    onOpen: () => setContextMenu(null),
  });

  const {
    selectedEdge,
    setSelectedEdge,
    isDeletingEdge,
    closeDeleteConnectionModal,
    clearSelectedEdge,
    handleDeleteConnection,
    syncSelectedEdgeWithGraph,
  } = useEdgeDeletion({ route, name });

  const {
    menuState,
    showMenu,
    connectedWordEntries,
    linkableEntries,
    connectedComponents,
  } = useGraphDerivedData({
    graphData,
    searchField,
    word,
    selectedWordUuid: selectedWord?.uuid,
    forceMenu,
    dictionaries,
    name,
    linkSourceNode,
    linkSearchValue,
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleMenuNodeSelect = useCallback((node: GraphNode) => {
    if (!node.wordData) return;

    setForceMenu(false);
    setSelectedWord(node.wordData);
    setContextMenu(null);

    if (navigateOnWordClick || !doubleView) {
      navigate(
        `/markdown?path=${encodeURIComponent(route)}&name=${encodeURIComponent(name)}&uuid=${encodeURIComponent(node.wordData.uuid ?? "")}`,
      );
    }
  }, [doubleView, name, navigate, navigateOnWordClick, route, setSelectedWord]);

  const handleNodeActivate = useCallback((wordData: TranslationEntry) => {
    if (!navigateOnWordClick) {
      setSelectedWord(wordData);
    }
  }, [navigateOnWordClick, setSelectedWord]);

  const { svgRef, containerRef, topRef } = useKnowledgeGraphCanvas({
    graphData,
    menuAnchorId: menuState.anchorId,
    directOnlyValue,
    route,
    name,
    navigate,
    navigateOnWordClick,
    doubleView,
    selectedEdge,
    isSavingLink,
    onNodeHover: setTooltipWord,
    onNodeActivate: handleNodeActivate,
    onNodeContextMenu: setContextMenu,
    onCloseContextMenu: closeContextMenu,
    onClearLinkModal: clearLinkModal,
    onEdgeSelect: setSelectedEdge,
  });

  useEffect(() => {
    if (isDirectOnlyControlled) {
      setDirectOnly(directOnlyOverride as boolean);
    }
  }, [directOnlyOverride, isDirectOnlyControlled]);

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
    if (selectedWord?.uuid) {
      hasHadSelectionRef.current = true;
    }
  }, [selectedWord?.uuid]);

  useEffect(() => {
    if (!autoSelectRandomWord) return;
    if (selectedWord?.uuid) return;
    if (hasHadSelectionRef.current) return;
    if (connectedWordEntries.length === 0) return;

    const randomIndex = Math.floor(Math.random() * connectedWordEntries.length);
    setSelectedWord(connectedWordEntries[randomIndex]);
  }, [autoSelectRandomWord, connectedWordEntries, selectedWord?.uuid, setSelectedWord]);

  useEffect(() => {
    if (!showMenu) return;

    setTooltipWord(null);
    setContextMenu(null);
    clearSelectedEdge();

    if (!isSavingLink) {
      clearLinkModal();
    }
  }, [clearLinkModal, clearSelectedEdge, isSavingLink, showMenu]);

  useEffect(() => {
    if (selectedWord?.uuid) {
      setForceMenu(false);
    }
  }, [selectedWord?.uuid]);

  useEffect(() => {
    syncSelectedEdgeWithGraph(graphData);
  }, [graphData, syncSelectedEdgeWithGraph]);

  useEffect(() => {
    const handlePointer = () => closeContextMenu();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeContextMenu();

      if (!isSavingLink) {
        clearLinkModal();
      }
      if (!isDeletingEdge) {
        clearSelectedEdge();
      }
    };

    window.addEventListener("pointerdown", handlePointer);
    window.addEventListener("scroll", handlePointer, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("scroll", handlePointer, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, [clearLinkModal, clearSelectedEdge, closeContextMenu, isDeletingEdge, isSavingLink]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      <div ref={topRef} className="relative w-full flex-1 min-h-0" style={{ flexBasis: "75%" }}>
        {tooltipWord && (
          <div className="max-w-3/4 border rounded-xl absolute flex top-3.5 ml-2.5 right-4 z-10 bg-card p-4 shadow-lg pointer-events-none border-border text-card-foreground">
            <WordCard name={name} word={tooltipWord} />
          </div>
        )}

        <ExploreMenuOverlay
          show={showMenu}
          menuState={menuState}
          onSelectNode={handleMenuNodeSelect}
        />

        <NodeContextMenu
          contextMenu={contextMenu}
          onLinkWord={(menu) => openLinkModal(menu.node)}
          onSelectWord={(menu) => {
            if (menu.node.wordData) {
              setSelectedWord(menu.node.wordData);
            }
            setContextMenu(null);
          }}
        />

        <LinkWordModal
          sourceNode={linkSourceNode}
          searchValue={linkSearchValue}
          onSearchChange={setLinkSearchValue}
          linkableEntries={linkableEntries}
          isSaving={isSavingLink}
          onLinkWord={(entry) => {
            void handleLinkWord(entry);
          }}
          onClose={closeLinkModal}
        />

        <DeleteConnectionModal
          selectedEdge={selectedEdge}
          isDeleting={isDeletingEdge}
          onClose={closeDeleteConnectionModal}
          onConfirmDelete={() => {
            void handleDeleteConnection();
          }}
        />

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
          onClick={closeContextMenu}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>

      {showBottomSelector && (
        <div className="relative w-full border-t border-border/60 bg-background/70 px-3 py-3 h-fit" style={{ flexBasis: "15%" }}>
          <div className="mb-2 text-sm font-semibold text-foreground">
            Connected components
          </div>
          {connectedComponents.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6">
              {searchField.trim() !== ""
                ? "No matching connected components found."
                : "No connected components yet."}
            </div>
          ) : (
            <EmblaCarousel
              slides={connectedComponents}
              options={{ dragFree: true, align: "start" }}
              getSlideKey={(component) =>
                component.id
              }
              slideClassName="basis-[300px] min-w-0 shrink-0 pr-3 flex"
              renderSlide={(component) => (
                <div
                  className="h-fit w-full rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden"
                  onClick={() => setSelectedWord(component.representative)}
                >
                  <div className="flex h-full items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {component.words.length} words
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {component.connectionCount} connections
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Hub
                        </div>
                        <div className="text-sm font-semibold text-foreground truncate">
                          {component.representative.pair[0]?.original?.word ?? "Unknown"}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground truncate">
                        {component.words
                          .slice(0, 4)
                          .map((entry) => entry.pair[0]?.original?.word ?? "")
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                    <div className="mt-1 shrink-0 text-muted-foreground">
                      <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden="true">
                        {Array.from({
                          length: Math.min(Math.max(component.words.length - 1, 1), 8),
                        }).map((_, index, items) => {
                          const angle = (index / items.length) * Math.PI * 2;
                          const x = 42 + Math.cos(angle) * 24;
                          const y = 42 + Math.sin(angle) * 24;
                          return (
                            <g key={`${component.id}-mini-${index}`}>
                              <line
                                x1={42}
                                y1={42}
                                x2={x}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                                strokeWidth={1.25}
                              />
                              <circle
                                cx={x}
                                cy={y}
                                r={3.5}
                                fill="currentColor"
                                fillOpacity={0.35}
                              />
                            </g>
                          );
                        })}
                        <circle cx={42} cy={42} r={6.5} fill="currentColor" fillOpacity={0.85} />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
