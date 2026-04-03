import WordCard from "@/components/word-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TranslationGameHistoryEntry } from "../types";

type TranslationGameRecentRoundsProps = {
  history: TranslationGameHistoryEntry[];
  dictionaryName: string;
};

export function TranslationGameRecentRounds({
  history,
  dictionaryName,
}: TranslationGameRecentRoundsProps) {
  return (
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
          <div className="grid xl:grid-cols-2 grid-rows-1 gap-4">
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
                    name={dictionaryName}
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
                    <span className="font-medium text-foreground">Expected:</span>{" "}
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
  );
}
