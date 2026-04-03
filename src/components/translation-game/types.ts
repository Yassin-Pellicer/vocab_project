import type { TranslationEntry } from "@/types/translation-entry";

export type GameDirection = "forward" | "reverse" | "mixed";
export type EffectiveGameDirection = "forward" | "reverse";
export type TranslationGameStage = "setup" | "playing";

export type TranslationGameConnectedComponent = {
  id: string;
  nodeIds: string[];
  wordCount: number;
  connectionCount: number;
  representativeLabel: string;
};

export type GameCandidate = {
  key: string;
  entry: TranslationEntry;
  pairIndex: number;
};

export type TranslationGameQuestion = {
  key: string;
  entry: TranslationEntry;
  selectedPairIndex: number;
  direction: EffectiveGameDirection;
  promptLabel: string;
  answerLabel: string;
  acceptedAnswers: string[];
  definitions: string[];
};

export type TranslationGameFeedback = {
  tone: "correct" | "incorrect";
  text: string;
};

export type TranslationGameHistoryEntry = {
  question: TranslationGameQuestion;
  status: "correct" | "incorrect";
  submittedAnswer: string;
  feedbackText: string;
  hintsUsed: number;
  pointsEarned: number;
};

export type DirectionOption = {
  value: GameDirection;
  title: string;
  description: string;
};
