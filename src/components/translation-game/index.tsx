"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { cn } from "@/lib/utils";
import WordCard from "@/components/word-card";
import useTranslationGame, {
  type GameDirection,
} from "./hook";
import {
  ArrowLeftRight,
  BookCheck,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

const DIRECTION_OPTIONS: Array<{
  value: GameDirection;
  title: string;
  description: string;
}> = [
  {
    value: "forward",
    title: "Original to translation",
    description: "Show the source word first and type one of its translations.",
  },
  {
    value: "reverse",
    title: "Translation to original",
    description: "See a translation prompt and answer with the original word.",
  },
  {
    value: "mixed",
    title: "Mixed round",
    description: "Blend both directions while avoiding the same prompts too often.",
  },
];

const directionLabel: Record<GameDirection, string> = {
  forward: "Original -> translation",
  reverse: "Translation -> original",
  mixed: "Mixed session",
};

const CONFIG_PANEL_DEFAULT_WIDTH = 380;
const CONFIG_PANEL_MIN_WIDTH = 310;
const SESSION_PANEL_MIN_WIDTH = 460;

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
  const filterSummary =
    selectedTypes.length > 0
      ? `${selectedTypes.length} type filter${selectedTypes.length === 1 ? "" : "s"}`
      : "All word types";
  const sessionButtonLabel = isSessionActive ? "Restart Session" : "Start Training";

  return (
    <div className="flex min-h-0 h-[calc(100vh-64px)] flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Translation Game
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Train with {dictionaryTitle}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Configure your run on the left, then practice in the session panel
              on the right. Drag the divider to resize both sides.
            </p>
          </div>
          <div className="grid min-w-56 grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Dictionary Words
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {list.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Prompt Pool
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {filteredCandidates.length}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={splitContainerRef}
          className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card/35 shadow-sm"
        >
          <aside
            className="shrink-0 border-r border-border/60 bg-card/70"
            style={{ width: configPanelWidth }}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Session Config
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Direction, filters, and launch controls.
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Search scope</p>
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Filter words and types"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Prompt direction</p>
                  <div className="grid gap-2">
                    {DIRECTION_OPTIONS.map((option) => {
                      const active = direction === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setDirection(option.value)}
                          className={cn(
                            "rounded-2xl border p-3 text-left transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/60 bg-background hover:bg-accent/30",
                          )}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <ArrowLeftRight className="size-4" />
                            {option.title}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Word type filters</p>
                    {selectedTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={clearTypeFilters}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{filterSummary}</p>

                  {availableTypes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                      No configured word types yet. This session will use all
                      matching words.
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {availableTypes.map((type) => {
                        const checked = selectedTypes.includes(type);
                        return (
                          <label
                            key={type}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl border px-3 py-2 transition-colors",
                              checked
                                ? "border-primary bg-primary/10"
                                : "border-border/60 bg-background hover:bg-accent/20",
                            )}
                          >
                            <Checkbox
                              className="border-primary/30 data-[state=checked]:border-primary focus:ring-0"
                              checked={checked}
                              onCheckedChange={() => toggleType(type)}
                            />
                            <span className="min-w-0 truncate text-sm font-medium text-foreground">
                              {type}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-border/60 bg-background/50 px-4 py-4">
                <div className="rounded-2xl border border-border/60 bg-card/80 px-3 py-3 text-sm">
                  <p className="font-semibold text-foreground">
                    {filteredCandidates.length} prompt
                    {filteredCandidates.length === 1 ? "" : "s"} ready
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {filteredWords.length} word
                    {filteredWords.length === 1 ? "" : "s"} match the current
                    filters.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {directionLabel[direction]}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={startSession}
                  disabled={!canStart}
                  className="w-full"
                >
                  {isSessionActive ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {sessionButtonLabel}
                </Button>

                {isSessionActive && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={returnToSetup}
                    className="w-full"
                  >
                    Back To Setup State
                  </Button>
                )}
              </div>
            </div>
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
                <Card className="mx-auto mt-8 w-full max-w-2xl border-dashed border-border/70 bg-card/70">
                  <CardHeader className="items-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/30">
                      <Target className="size-7 text-muted-foreground" />
                    </div>
                    <CardTitle>Session Not Started</CardTitle>
                    <CardDescription className="max-w-xl">
                      Configure your direction and filters on the left, then
                      start the run to load the first prompt here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center pb-6">
                    <Button type="button" onClick={startSession} disabled={!canStart}>
                      <Play className="size-4" />
                      Start Training
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border/60 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Score
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {score.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Answered
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {answeredCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Direction
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {directionLabel[direction]}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Active Filters
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {filterSummary}
                      </p>
                    </div>
                  </div>

                  <Card className="border-border/60 bg-card/80">
                    <CardHeader className="gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-2xl">
                            <Target className="size-5" />
                            Current Prompt
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {directionLabel[direction]} with {filteredCandidates.length}{" "}
                            available prompt
                            {filteredCandidates.length === 1 ? "" : "s"}.
                          </CardDescription>
                        </div>
                        <Button type="button" variant="secondary" onClick={startSession}>
                          <RotateCcw className="size-4" />
                          Restart
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                      <div className="rounded-3xl border border-border/60 bg-linear-to-br from-background via-card to-accent/10 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {currentQuestion?.direction === "forward"
                              ? "Original -> translation"
                              : "Translation -> original"}
                          </span>
                          {currentPair?.original?.gender && (
                            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                              {currentPair.original.gender}
                            </span>
                          )}
                          {currentPair?.original?.number && (
                            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                              {currentPair.original.number}
                            </span>
                          )}
                          {currentQuestion?.entry.type && (
                            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                              {currentQuestion.entry.type}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                          {currentQuestion?.promptLabel}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Input
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
                            placeholder="Type your answer"
                            autoFocus
                            className="h-12 text-base"
                          />
                          <Button type="submit" className="h-12 min-w-36">
                            <BookCheck className="size-4" />
                            Check Answer
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={showHint}
                            disabled={
                              !currentQuestion || currentQuestion.definitions.length === 0
                            }
                          >
                            <Sparkles strokeWidth={1.1} className="size-4" />
                            Show Hint
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            {currentQuestion?.definitions.length
                              ? `${revealedHints.length}/${currentQuestion.definitions.length} hints revealed`
                              : "No hints configured for this pair"}
                          </p>
                        </div>

                        {revealedHints.length > 0 && (
                          <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                              Hints
                            </p>
                            <div className="mt-2 space-y-2 text-sm text-foreground">
                              {revealedHints.map((hint, index) => (
                                <p key={`${currentQuestion?.key}-hint-${index}`}>
                                  <sup>{index + 1}</sup> {hint}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {feedback && (
                          <div
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-sm",
                              feedback.tone === "correct"
                                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-destructive/35 bg-destructive/10 text-destructive",
                            )}
                          >
                            {feedback.text}
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/80">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Rounds</CardTitle>
                      <CardDescription>
                        Your latest answers, with the card details still visible.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {history.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                          Answer a few prompts and they will stack up here.
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {history.map((entry) => (
                            <div
                              key={`history-${entry.question.key}-${entry.submittedAnswer}-${entry.hintsUsed}`}
                              className={cn(
                                "rounded-2xl border p-4",
                                entry.status === "correct"
                                  ? "border-emerald-500/25 bg-emerald-500/5"
                                  : "border-destructive/25 bg-destructive/5",
                              )}
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                                    entry.status === "correct"
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                      : "bg-destructive/15 text-destructive",
                                  )}
                                >
                                  {entry.status === "correct" ? "Correct" : "Needs review"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.question.direction === "forward"
                                    ? "Original -> translation"
                                    : "Translation -> original"}
                                </span>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-background p-4">
                                <WordCard
                                  word={entry.question.entry}
                                  name={name}
                                  interactive={false}
                                />
                              </div>
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="text-foreground">
                                  <span className="font-medium">Prompt:</span>{" "}
                                  {entry.question.promptLabel}
                                </p>
                                <p className="text-foreground">
                                  <span className="font-medium">Your answer:</span>{" "}
                                  {entry.submittedAnswer || "No answer"}
                                </p>
                                <p className="text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    Expected:
                                  </span>{" "}
                                  {entry.question.answerLabel}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Hints used: {entry.hintsUsed} • Points earned:{" "}
                                  {entry.pointsEarned.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
