"use client";

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
import { cn } from "@/lib/utils";
import WordCard from "@/components/word-card";
import useTranslationGame, {
  type GameDirection,
} from "./hook";
import {
  ArrowLeftRight,
  BookCheck,
  Filter,
  Play,
  RotateCcw,
  Search,
  Settings2,
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
    searchQuery,
    setSearchQuery,
    filteredWords,
    filteredCandidates,
    previewWord,
  } = useTranslationGame({ route, name });

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
  const canStart = filteredCandidates.length > 0;
  const filterSummary =
    selectedTypes.length > 0
      ? `${selectedTypes.length} type filter${selectedTypes.length === 1 ? "" : "s"}`
      : "All word types";

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <Card className="overflow-hidden border-border/60 bg-linear-to-br from-background via-card to-accent/10">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="size-3.5" />
                  Translation practice
                </div>
                <CardTitle className="text-3xl tracking-tight">
                  Train with the words you actually care about
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm">
                  Build a session from your current dictionary, tune the prompt
                  direction, narrow the pool with filters, and let the game
                  cycle through prompts with a shuffle bag that reduces repeats.
                </CardDescription>
              </div>
              <div className="grid min-w-[220px] grid-cols-2 gap-3">
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
                    Matching Prompts
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {filteredCandidates.length}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {stage === "setup" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_400px]">
            <div className="grid gap-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Filter className="size-5" />
                    Session Setup
                  </CardTitle>
                  <CardDescription>
                    Choose what goes into this run before we start asking
                    questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Search the practice pool
                      </p>
                      {(searchQuery || selectedTypes.length > 0) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            clearTypeFilters();
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Filter by original word, translation, or type"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {filteredWords.length} word
                      {filteredWords.length === 1 ? "" : "s"} match the current
                      filters.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Prompt direction
                    </p>
                    <div className="grid gap-3 lg:grid-cols-3">
                      {DIRECTION_OPTIONS.map((option) => {
                        const active = direction === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setDirection(option.value)}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-colors",
                              active
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border/60 bg-background hover:bg-accent/30",
                            )}
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <ArrowLeftRight className="size-4" />
                              {option.title}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Word type filters
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {filterSummary}
                      </p>
                    </div>
                    {availableTypes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                        This dictionary does not have configured word types yet,
                        so the session will use all words.
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {availableTypes.map((type) => {
                          const checked = selectedTypes.includes(type);
                          return (
                            <label
                              key={type}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                checked
                                  ? "border-primary bg-primary/10"
                                  : "border-border/60 bg-background hover:bg-accent/20",
                              )}
                            >
                              <Checkbox
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

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-accent/10 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Ready to start
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {filteredCandidates.length} prompt
                        {filteredCandidates.length === 1 ? "" : "s"} across{" "}
                        {filteredWords.length} word
                        {filteredWords.length === 1 ? "" : "s"}.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={startSession}
                      disabled={!canStart}
                      className="min-w-44"
                    >
                      <Play className="size-4" />
                      Start Training
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Session Preview</CardTitle>
                  <CardDescription>
                    A sample card from the current filter set.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewWord ? (
                    <div className="rounded-2xl border border-border/60 bg-background p-4">
                      <WordCard
                        word={previewWord}
                        name={name}
                        interactive={false}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                      No words match the current filters yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-linear-to-br from-card via-card to-accent/10">
                <CardHeader>
                  <CardTitle className="text-lg">How this round behaves</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Prompts are drawn from a shuffled bag of word pairs instead
                    of pure `Math.random()`.
                  </p>
                  <p>
                    Recent prompts stay in a small cooldown window, so one word
                    is much less likely to appear back-to-back.
                  </p>
                  <p>
                    In mixed mode, each pair can flip direction between rounds
                    while still keeping repetition under control.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
            <div className="grid gap-6">
              <Card className="border-border/60">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={returnToSetup}
                      >
                        <Settings2 className="size-4" />
                        Session Settings
                      </Button>
                      <Button type="button" variant="secondary" onClick={startSession}>
                        <RotateCcw className="size-4" />
                        Restart
                      </Button>
                    </div>
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
                    <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      Translate this
                    </p>
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
                        disabled={!currentQuestion || currentQuestion.definitions.length === 0}
                      >
                        <Sparkles className="size-4" />
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
            </div>

            <div className="grid gap-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Run Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/60 bg-background p-4">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Score
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {score.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background p-4">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Answered
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {answeredCount}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Active filters</p>
                    <p className="mt-2">{directionLabel[direction]}</p>
                    <p className="mt-1">{filterSummary}</p>
                    <p className="mt-1">
                      {searchQuery
                        ? `Search: "${searchQuery}"`
                        : "Search: all matching words"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
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
                    <div className="grid max-h-[calc(100vh-320px)] gap-4 overflow-y-auto pr-1">
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
          </div>
        )}
      </div>
    </div>
  );
}
