import type { TranslationEntry } from "@/types/translation-entry";
import { useMemo } from "react";
import { ALL_COMPONENTS_VALUE } from "./constants";
import { buildConnectedComponents } from "./connected-components";
import { entryMatchesSearch, isPairTrainable } from "./game-utils";
import type {
  GameCandidate,
  TranslationGameConnectedComponent,
} from "./types";

type UseTranslationGameFiltersParams = {
  list: TranslationEntry[];
  metadataTypes?: string[];
  searchQuery: string;
  selectedTypes: string[];
  selectedComponentId: string;
};

type UseTranslationGameFiltersResult = {
  availableTypes: string[];
  connectedComponents: TranslationGameConnectedComponent[];
  selectedComponent: TranslationGameConnectedComponent | null;
  filteredWords: TranslationEntry[];
  filteredCandidates: GameCandidate[];
};

export function useTranslationGameFilters({
  list,
  metadataTypes,
  searchQuery,
  selectedTypes,
  selectedComponentId,
}: UseTranslationGameFiltersParams): UseTranslationGameFiltersResult {
  const availableTypes = useMemo(() => {
    const fromMetadata = metadataTypes?.filter(Boolean) ?? [];
    if (fromMetadata.length > 0) return fromMetadata;

    return [
      ...new Set(
        list
          .map((entry) => entry.type?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ];
  }, [list, metadataTypes]);

  const connectedComponents = useMemo(() => buildConnectedComponents(list), [list]);

  const selectedComponent = useMemo(() => {
    if (selectedComponentId === ALL_COMPONENTS_VALUE) return null;
    return connectedComponents.find((component) => component.id === selectedComponentId) ?? null;
  }, [connectedComponents, selectedComponentId]);

  const selectedComponentNodeIds = useMemo(() => {
    if (!selectedComponent) return null;
    return new Set(selectedComponent.nodeIds);
  }, [selectedComponent]);

  const filteredWords = useMemo(() => {
    return list.filter((entry) => {
      if (selectedComponentNodeIds) {
        if (!entry.uuid) return false;
        if (!selectedComponentNodeIds.has(entry.uuid)) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(entry.type)) {
        return false;
      }

      return entryMatchesSearch(entry, searchQuery);
    });
  }, [list, searchQuery, selectedComponentNodeIds, selectedTypes]);

  const filteredCandidates = useMemo<GameCandidate[]>(() => {
    return filteredWords.flatMap((entry, entryIndex) =>
      entry.pair
        .map((pair, pairIndex) => ({ pair, pairIndex }))
        .filter(({ pair }) => isPairTrainable(pair))
        .map(({ pairIndex }) => ({
          key: `${entry.uuid ?? `${entryIndex}-${entry.dateAdded}`}:${pairIndex}`,
          entry,
          pairIndex,
        })),
    );
  }, [filteredWords]);

  return {
    availableTypes,
    connectedComponents,
    selectedComponent,
    filteredWords,
    filteredCandidates,
  };
}
