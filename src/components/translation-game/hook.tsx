import { DictionaryContext } from "@/context/dictionary-context";
import { useCallback, useEffect, useState } from "react";
import { ALL_COMPONENTS_VALUE, EMPTY_TRANSLATIONS } from "./constants";
import { useTranslationGameFilters } from "./use-translation-game-filters";
import { useTranslationGameSession } from "./use-translation-game-session";
import type { GameDirection } from "./types";

export type {
  EffectiveGameDirection,
  GameDirection,
  TranslationGameConnectedComponent,
  TranslationGameFeedback,
  TranslationGameHistoryEntry,
  TranslationGameQuestion,
  TranslationGameStage,
} from "./types";

export default function useTranslationGame({
  route,
  name,
}: {
  route: string;
  name: string;
}) {
  const loadTranslations = DictionaryContext((state) => state.loadTranslations);
  const storedList = DictionaryContext((state) => state.dictionaries[name]);
  const metadata = DictionaryContext((state) => state.dictionaryMetadata[name]);

  const list = storedList ?? EMPTY_TRANSLATIONS;
  const dictionaryTitle = metadata?.name?.trim() || name;

  const [direction, setDirection] = useState<GameDirection>("forward");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState(
    ALL_COMPONENTS_VALUE,
  );

  const {
    availableTypes,
    connectedComponents,
    selectedComponent,
    filteredWords,
    filteredCandidates,
  } = useTranslationGameFilters({
    list,
    metadataTypes: metadata?.typeWords,
    searchQuery,
    selectedTypes,
    selectedComponentId,
  });

  const session = useTranslationGameSession({ filteredCandidates, direction });

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  }, []);

  const clearTypeFilters = useCallback(() => {
    setSelectedTypes([]);
  }, []);

  useEffect(() => {
    void loadTranslations(route, name);
  }, [loadTranslations, name, route]);

  useEffect(() => {
    if (selectedComponentId === ALL_COMPONENTS_VALUE) return;
    if (connectedComponents.some((component) => component.id === selectedComponentId)) return;
    setSelectedComponentId(ALL_COMPONENTS_VALUE);
  }, [connectedComponents, selectedComponentId]);

  return {
    stage: session.stage,
    list,
    currentQuestion: session.currentQuestion,
    history: session.history,
    score: session.score,
    answeredCount: session.answeredCount,
    userInput: session.userInput,
    setUserInput: session.setUserInput,
    feedback: session.feedback,
    revealedHints: session.revealedHints,
    showHint: session.showHint,
    handleSubmit: session.handleSubmit,
    startSession: session.startSession,
    returnToSetup: session.returnToSetup,
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
  };
}
