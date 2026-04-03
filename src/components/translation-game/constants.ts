import type { TranslationEntry } from "@/types/translation-entry";
import type { DirectionOption, GameDirection } from "./types";

export const ALL_COMPONENTS_VALUE = "__all_components__";

export const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

export const DIRECTION_OPTIONS: DirectionOption[] = [
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

export const DIRECTION_LABELS: Record<GameDirection, string> = {
  forward: "Original -> translation",
  reverse: "Translation -> original",
  mixed: "Mixed session",
};

export const CONFIG_PANEL_DEFAULT_WIDTH = 380;
export const CONFIG_PANEL_MIN_WIDTH = 310;
export const SESSION_PANEL_MIN_WIDTH = 460;

export const QUESTION_ADVANCE_DELAYS = {
  correct: 900,
  incorrect: 1400,
} as const;
