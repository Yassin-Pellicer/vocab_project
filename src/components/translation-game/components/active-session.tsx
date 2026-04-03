import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OriginalTranslationPair } from "@/types/original-translation-pair";
import { BookCheck, RotateCcw, Sparkles, Target } from "lucide-react";
import { DIRECTION_LABELS } from "../constants";
import type {
  GameDirection,
  TranslationGameFeedback,
  TranslationGameHistoryEntry,
  TranslationGameQuestion,
} from "../types";
import { TranslationGameRecentRounds } from "./recent-rounds";

type TranslationGameActiveSessionProps = {
  score: number;
  answeredCount: number;
  direction: GameDirection;
  activeFilterSummary: string;
  currentQuestion: TranslationGameQuestion | null;
  currentPair: OriginalTranslationPair | null;
  filteredCandidatesCount: number;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  showHint: () => void;
  revealedHints: string[];
  feedback: TranslationGameFeedback | null;
  startSession: () => void;
  history: TranslationGameHistoryEntry[];
  dictionaryName: string;
};

export function TranslationGameActiveSession({
  score,
  answeredCount,
  direction,
  activeFilterSummary,
  currentQuestion,
  currentPair,
  filteredCandidatesCount,
  userInput,
  setUserInput,
  handleSubmit,
  showHint,
  revealedHints,
  feedback,
  startSession,
  history,
  dictionaryName,
}: TranslationGameActiveSessionProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Score</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{score.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Answered</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{answeredCount}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Direction</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {DIRECTION_LABELS[direction]}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Active Filters
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {activeFilterSummary}
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
                {DIRECTION_LABELS[direction]} with {filteredCandidatesCount} available
                prompt{filteredCandidatesCount === 1 ? "" : "s"}.
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
                disabled={!currentQuestion || currentQuestion.definitions.length === 0}
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

      <TranslationGameRecentRounds
        history={history}
        dictionaryName={dictionaryName}
      />
    </div>
  );
}
