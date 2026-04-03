import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play, Target } from "lucide-react";

type TranslationGameSessionIdleProps = {
  canStart: boolean;
  startSession: () => void;
};

export function TranslationGameSessionIdle({
  canStart,
  startSession,
}: TranslationGameSessionIdleProps) {
  return (
    <Card className="mx-auto mt-8 w-full max-w-2xl border-dashed border-border/70 bg-card/70">
      <CardHeader className="items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/30">
          <Target className="size-7 text-muted-foreground" />
        </div>
        <CardTitle>Session Not Started</CardTitle>
        <CardDescription className="max-w-xl">
          Configure your direction and filters on the left, then start the run
          to load the first prompt here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button type="button" onClick={startSession} disabled={!canStart}>
          <Play className="size-4" />
          Start Training
        </Button>
      </CardContent>
    </Card>
  );
}
