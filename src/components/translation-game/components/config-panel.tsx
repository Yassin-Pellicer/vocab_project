import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Play, RotateCcw, Search } from "lucide-react";
import {
  ALL_COMPONENTS_VALUE,
  DIRECTION_LABELS,
  DIRECTION_OPTIONS,
} from "../constants";
import type {
  GameDirection,
  TranslationGameConnectedComponent,
} from "../types";

type TranslationGameConfigPanelProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  connectedComponents: TranslationGameConnectedComponent[];
  selectedComponentId: string;
  setSelectedComponentId: React.Dispatch<React.SetStateAction<string>>;
  selectedComponent: TranslationGameConnectedComponent | null;
  selectedComponentIndex: number;
  direction: GameDirection;
  setDirection: React.Dispatch<React.SetStateAction<GameDirection>>;
  availableTypes: string[];
  selectedTypes: string[];
  toggleType: (type: string) => void;
  clearTypeFilters: () => void;
  typeFilterSummary: string;
  filteredCandidatesCount: number;
  filteredWordsCount: number;
  canStart: boolean;
  isSessionActive: boolean;
  sessionButtonLabel: string;
  startSession: () => void;
  returnToSetup: () => void;
};

export function TranslationGameConfigPanel({
  searchQuery,
  setSearchQuery,
  connectedComponents,
  selectedComponentId,
  setSelectedComponentId,
  selectedComponent,
  selectedComponentIndex,
  direction,
  setDirection,
  availableTypes,
  selectedTypes,
  toggleType,
  clearTypeFilters,
  typeFilterSummary,
  filteredCandidatesCount,
  filteredWordsCount,
  canStart,
  isSessionActive,
  sessionButtonLabel,
  startSession,
  returnToSetup,
}: TranslationGameConfigPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
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
          <p className="text-sm font-medium text-foreground">Knowledge graph component</p>
          {connectedComponents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              No linked components yet. Connect words in the knowledge graph to
              unlock component-only practice.
            </div>
          ) : (
            <>
              <Select
                value={selectedComponentId}
                onValueChange={setSelectedComponentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose component scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COMPONENTS_VALUE}>
                    All connected components
                  </SelectItem>
                  {connectedComponents.map((component, index) => (
                    <SelectItem key={component.id} value={component.id}>
                      Component {index + 1} · {component.wordCount} words ·{" "}
                      {component.connectionCount} links
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedComponent && selectedComponentIndex >= 0
                  ? `Using Component ${selectedComponentIndex + 1}. Hub: ${selectedComponent.representativeLabel}.`
                  : `${connectedComponents.length} connected component${connectedComponents.length === 1 ? "" : "s"} available.`}
              </p>
            </>
          )}
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
          <p className="text-xs text-muted-foreground">{typeFilterSummary}</p>

          {availableTypes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              No configured word types yet. This session will use all matching
              words.
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
            {filteredCandidatesCount} prompt
            {filteredCandidatesCount === 1 ? "" : "s"} ready
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredWordsCount} word
            {filteredWordsCount === 1 ? "" : "s"} match the current filters.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {DIRECTION_LABELS[direction]}
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
  );
}
