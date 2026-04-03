"use client";

import { useRef } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { BookCheck } from "lucide-react";
import {
  ALL_COMPONENTS_VALUE,
  CONFIG_PANEL_DEFAULT_WIDTH,
  CONFIG_PANEL_MIN_WIDTH,
  SESSION_PANEL_MIN_WIDTH,
} from "./constants";
import useTranslationGame from "./hook";
import { TranslationGameConfigPanel } from "./components/config-panel";
import { TranslationGameSessionIdle } from "./components/session-idle";
import { TranslationGameActiveSession } from "./components/active-session";

export default function TranslationGame({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const {
    stage,
    list,
    currentQuestion,
    history,
    score,
    answeredCount,
    userInput,
    setUserInput,
    feedback,
    revealedHints,
    showHint,
    handleSubmit,
    startSession,
    returnToSetup,
    availableTypes,
    selectedTypes,
    toggleType,
    clearTypeFilters,
    direction,
    setDirection,
    dictionaryTitle,
    searchQuery,
    setSearchQuery,
    connectedComponents,
    selectedComponentId,
    setSelectedComponentId,
    selectedComponent,
    filteredWords,
    filteredCandidates,
  } = useTranslationGame({ route, name });

  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const { width: configPanelWidth, handleResizeStart: handleConfigResize } =
    useResizablePanel({
      storageKey: `translation-game:config-panel:${route}:${name}`,
      defaultWidth: CONFIG_PANEL_DEFAULT_WIDTH,
      minWidth: CONFIG_PANEL_MIN_WIDTH,
      maxWidth: () => {
        const containerWidth =
          splitContainerRef.current?.clientWidth ?? window.innerWidth;
        return Math.max(
          CONFIG_PANEL_MIN_WIDTH,
          containerWidth - SESSION_PANEL_MIN_WIDTH,
        );
      },
      containerRef: splitContainerRef,
      collapseBelowMin: false,
      forceVisibleOnInit: true,
    });

  if (list.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl border-border/70 bg-card/80">
          <CardHeader className="items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-border/60 bg-muted/40">
              <BookCheck className="size-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No words available yet</CardTitle>
            <CardDescription>
              Add a few words to this dictionary first, then we can spin up a
              training session.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPair = currentQuestion
    ? currentQuestion.entry.pair[currentQuestion.selectedPairIndex]
    : null;
  const isSessionActive = stage === "playing";
  const canStart = filteredCandidates.length > 0;

  const typeFilterSummary =
    selectedTypes.length > 0
      ? `${selectedTypes.length} type filter${selectedTypes.length === 1 ? "" : "s"}`
      : "All word types";
  const selectedComponentIndex =
    selectedComponentId === ALL_COMPONENTS_VALUE
      ? -1
      : connectedComponents.findIndex((component) => component.id === selectedComponentId);
  const componentFilterSummary =
    selectedComponent && selectedComponentIndex >= 0
      ? `Component ${selectedComponentIndex + 1} (${selectedComponent.wordCount} words)`
      : "All connected components";
  const activeFilterSummary = `${typeFilterSummary} · ${componentFilterSummary}`;

  const sessionButtonLabel = isSessionActive
    ? "Restart Session"
    : "Start Training";

  return (
    <div className="flex min-h-0 h-[calc(100vh-64px)] flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4 shadow-sm border-b">
          <div className="my-auto flex flex-col align-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Train with {dictionaryTitle}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Configure your run on the left, then practice in the session panel
              on the right. Drag the divider to resize both sides.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-fit flex px-4 py-2 justify-between flex-row items-center align-center gap-4 rounded-2xl border border-border/60 bg-background/70">
              <p className="text-sm text-muted-foreground">
                Dictionary Words
              </p>
              <p className=" text-xl font-semibold text-foreground">
                {list.length}
              </p>
            </div>
            <div className="w-fit flex px-4 py-2 justify-between flex-row items-center align-center gap-4 rounded-2xl border border-border/60 bg-background/70">
              <p className="text-sm text-muted-foreground">
                Prompt Pool
              </p>
              <p className="text-xl font-semibold text-foreground">
                {filteredCandidates.length}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={splitContainerRef}
          className="flex min-h-0 flex-1 overflow-hidden bg-card/35 shadow-sm"
        >
          <aside
            className="shrink-0 border-r border-border/60 bg-accent/2.5 transition-colors"
            style={{ width: configPanelWidth }}
          >
            <TranslationGameConfigPanel
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              connectedComponents={connectedComponents}
              selectedComponentId={selectedComponentId}
              setSelectedComponentId={setSelectedComponentId}
              selectedComponent={selectedComponent}
              selectedComponentIndex={selectedComponentIndex}
              direction={direction}
              setDirection={setDirection}
              availableTypes={availableTypes}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              clearTypeFilters={clearTypeFilters}
              typeFilterSummary={typeFilterSummary}
              filteredCandidatesCount={filteredCandidates.length}
              filteredWordsCount={filteredWords.length}
              canStart={canStart}
              isSessionActive={isSessionActive}
              sessionButtonLabel={sessionButtonLabel}
              startSession={startSession}
              returnToSetup={returnToSetup}
            />
          </aside>

          <div
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize panels"
            onPointerDown={handleConfigResize}
            className="group relative w-2 shrink-0 cursor-col-resize bg-background/60 transition-colors hover:bg-muted/40"
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/80 transition-colors group-hover:bg-primary/60" />
          </div>

          <section className="min-w-0 flex-1 bg-background/55">
            <div className="h-full min-h-0 overflow-y-auto p-4">
              {!isSessionActive ? (
                <TranslationGameSessionIdle
                  canStart={canStart}
                  startSession={startSession}
                />
              ) : (
                <TranslationGameActiveSession
                  score={score}
                  answeredCount={answeredCount}
                  direction={direction}
                  activeFilterSummary={activeFilterSummary}
                  currentQuestion={currentQuestion}
                  currentPair={currentPair}
                  filteredCandidatesCount={filteredCandidates.length}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  handleSubmit={handleSubmit}
                  showHint={showHint}
                  revealedHints={revealedHints}
                  feedback={feedback}
                  startSession={startSession}
                  history={history}
                  dictionaryName={name}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
