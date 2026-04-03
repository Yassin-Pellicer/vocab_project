import type { TranslationEntry } from "@/types/translation-entry";
import type { DirectionOption, GameDirection } from "./types";

export const ALL_COMPONENTS_VALUE = "__all_components__";

export const EMPTY_TRANSLATIONS: TranslationEntry[] = [];

export const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    value: "forward",
    title: "Original to translation",
    description:
      "Show the source word first, then type one valid translation from your target language list.",
  },
  {
    value: "reverse",
    title: "Translation to original",
    description:
      "See a translated prompt first, then answer with the original source word that matches it.",
  },
  {
    value: "mixed",
    title: "Mixed round",
    description:
      "Alternate between both directions in one session for balanced practice, while reducing repeated prompts.",
  },
];

export const DIRECTION_LABELS: Record<GameDirection, string> = {
  forward: "Original -> translation",
  reverse: "Translation -> original",
  mixed: "Mixed session",
};

export const CONFIG_PANEL_DEFAULT_WIDTH = 600;
export const CONFIG_PANEL_MIN_WIDTH = 380;
export const SESSION_PANEL_MIN_WIDTH = 460;

export const QUESTION_ADVANCE_DELAYS = {
  correct: 900,
  incorrect: 1400,
} as const;
