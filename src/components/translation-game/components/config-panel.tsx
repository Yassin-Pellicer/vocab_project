import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TranslationEntry } from "@/types/translation-entry";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  FileWarning,
  Filter,
  GitGraph,
  Info,
  Menu,
  Play,
  RotateCcw,
  Search,
} from "lucide-react";
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

const getPrimaryWord = (entry: TranslationEntry) =>
  entry.pair[0]?.original?.word ?? "Unknown";

const getDirectionIcon = (value: GameDirection) => {
  if (value === "forward") {
    return <ArrowRight size={14} className="shrink-0" />;
  }
  if (value === "reverse") {
    return <ArrowLeft size={14} className="shrink-0" />;
  }
  return <ArrowLeftRight size={14} className="shrink-0" />;
};

type SectionInfoTooltipProps = {
  label: string;
  description: string;
};

const SectionInfoTooltip = ({ label, description }: SectionInfoTooltipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={`More info about ${label}`}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-foreground"
      >
        <Info size={14} />
      </button>
    </TooltipTrigger>
    <TooltipContent
      side="left"
      align="center"
      sideOffset={8}
      className="max-w-xs text-left leading-relaxed"
    >
      {description}
    </TooltipContent>
  </Tooltip>
);

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
  const [showComponentsPicker, setShowComponentsPicker] = useState(false);
  const selectedDirectionOption = DIRECTION_OPTIONS.find(
    (option) => option.value === direction,
  );
  const totalComponentWords = connectedComponents.reduce(
    (total, component) => total + component.words.length,
    0,
  );
  const totalComponentLinks = connectedComponents.reduce(
    (total, component) => total + component.connectionCount,
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
              <Search size={18} />
              Search and filter
            </p>
            <SectionInfoTooltip
              label="Search and filter"
              description="Type part of a word, translation, or tag to quickly narrow prompts; results update immediately and combine with every other active filter so you can focus your practice set."
            />
          </div>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Filter words and types"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
              <GitGraph size={18} />
              Knowledge graph component
            </p>
            <SectionInfoTooltip
              label="Knowledge graph component"
              description="Choose one connected component to practice a single graph cluster, or select no component filter to include all words; preview cards summarize component size, links, and representative hubs."
            />
          </div>
          {connectedComponents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              No linked components yet. Connect words in the knowledge graph to
              unlock component-only practice.
            </div>
          ) : (
            <>
              <Popover
                open={showComponentsPicker}
                onOpenChange={setShowComponentsPicker}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    <p className="flex flex-row gap-2 text-sm font-medium text-foreground items-center">
                      <Menu></Menu>
                      {showComponentsPicker
                        ? "Hide Component Picker"
                        : "Show Component Picker"}
                    </p>

                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[min(26rem,calc(100vw-2rem))] p-0 max-h-[min(26rem,72vh)]"
                >
                  <div className="border-b border-border/60 px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
                      Connected Components
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Choose a scope for practice prompts.
                    </p>
                  </div>
                  <div className="grid max-h-80 gap-2 overflow-y-auto p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComponentId(ALL_COMPONENTS_VALUE);
                        setShowComponentsPicker(false);
                      }}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition-colors",
                        selectedComponentId === ALL_COMPONENTS_VALUE
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-background hover:bg-accent/20",
                      )}
                    >
                      <p className="text-xs font-semibold text-foreground">
                        Do not use components
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Practice from the full dictionary, including unlinked words.
                      </p>
                    </button>

                    {connectedComponents.map((component, index) => {
                      const isSelected = component.id === selectedComponentId;
                      return (
                        <button
                          key={`${component.id}-preview`}
                          type="button"
                          onClick={() => {
                            setSelectedComponentId(component.id);
                            setShowComponentsPicker(false);
                          }}
                          className={cn(
                            "w-full rounded-2xl border p-3 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border/60 bg-background hover:bg-accent/20",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                Component {index + 1}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {component.words.length} words · {component.connectionCount} links
                              </p>
                            </div>
                            <div className="mt-0.5 shrink-0 text-muted-foreground">
                              <svg width={52} height={52} viewBox="0 0 84 84" aria-hidden="true">
                                {Array.from({
                                  length: Math.min(Math.max(component.words.length - 1, 1), 8),
                                }).map((_, previewIndex, items) => {
                                  const angle = (previewIndex / items.length) * Math.PI * 2;
                                  const x = 42 + Math.cos(angle) * 24;
                                  const y = 42 + Math.sin(angle) * 24;
                                  return (
                                    <g key={`${component.id}-mini-${previewIndex}`}>
                                      <line
                                        x1={42}
                                        y1={42}
                                        x2={x}
                                        y2={y}
                                        stroke="currentColor"
                                        strokeOpacity={0.3}
                                        strokeWidth={1.25}
                                      />
                                      <circle
                                        cx={x}
                                        cy={y}
                                        r={3.5}
                                        fill="currentColor"
                                        fillOpacity={0.35}
                                      />
                                    </g>
                                  );
                                })}
                                <circle
                                  cx={42}
                                  cy={42}
                                  r={6.5}
                                  fill="currentColor"
                                  fillOpacity={0.85}
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Hub:{" "}
                            <span className="font-semibold text-foreground">
                              {getPrimaryWord(component.representative)}
                            </span>
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {component.words
                              .map((entry) => getPrimaryWord(entry))
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {selectedComponent && selectedComponentIndex >= 0 ? (
                <div className="rounded-2xl border border-border/60 bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        Component {selectedComponentIndex + 1}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedComponent.words.length} words ·{" "}
                        {selectedComponent.connectionCount} links
                      </p>
                    </div>
                    <div className="mt-0.5 shrink-0 text-muted-foreground">
                      <svg width={52} height={52} viewBox="0 0 84 84" aria-hidden="true">
                        {Array.from({
                          length: Math.min(Math.max(selectedComponent.words.length - 1, 1), 8),
                        }).map((_, previewIndex, items) => {
                          const angle = (previewIndex / items.length) * Math.PI * 2;
                          const x = 42 + Math.cos(angle) * 24;
                          const y = 42 + Math.sin(angle) * 24;
                          return (
                            <g key={`${selectedComponent.id}-active-mini-${previewIndex}`}>
                              <line
                                x1={42}
                                y1={42}
                                x2={x}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                                strokeWidth={1.25}
                              />
                              <circle
                                cx={x}
                                cy={y}
                                r={3.5}
                                fill="currentColor"
                                fillOpacity={0.35}
                              />
                            </g>
                          );
                        })}
                        <circle cx={42} cy={42} r={6.5} fill="currentColor" fillOpacity={0.85} />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Hub:{" "}
                    <span className="font-semibold text-foreground">
                      {getPrimaryWord(selectedComponent.representative)}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {selectedComponent.words
                      .map((entry) => getPrimaryWord(entry))
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-background p-3">
                  <p className="text-xs font-semibold text-foreground">
                    No component filter
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Using the full dictionary scope. {connectedComponents.length} connected
                    component{connectedComponents.length === 1 ? "" : "s"} detected ({totalComponentWords} linked words · {totalComponentLinks} links).
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Hubs:{" "}
                    {connectedComponents
                      .map((component) => getPrimaryWord(component.representative))
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
              <ArrowLeftRight size={18} />
              Prompt Direction
            </p>
            <SectionInfoTooltip
              label="Prompt Direction"
              description="Set which side appears first for each prompt: forward asks for translations, reverse asks for originals, and mixed alternates both directions for balanced recall in one session."
            />
          </div>
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            {DIRECTION_OPTIONS.map((option) => {
              const active = direction === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDirection(option.value)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center text-xs font-semibold leading-tight transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 bg-background hover:bg-accent/30",
                  )}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {getDirectionIcon(option.value)}
                    <span className="text-left">{option.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {selectedDirectionOption && (
            <div className="text-xs text-muted-foreground">
              <p className="flex flex-row gap-2 text-xs text-foreground items-center">
                <FileWarning size={18} />
                {selectedDirectionOption.description}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
              <Filter size={18} />
              Word type Filters
            </p>
            <div className="flex items-center gap-2">
              <SectionInfoTooltip
                label="Word type filters"
                description="Limit prompts to one or more grammatical or custom word types; this works together with search and component scope to refine practice, and you can clear filters anytime to use all types again."
              />
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
          </div>
          <p className="text-xs text-muted-foreground">{typeFilterSummary}</p>

          {availableTypes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              No configured word types yet. This session will use all matching
              words.
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {availableTypes.map((type) => {
                const checked = selectedTypes.includes(type);
                return (
                  <label
                    key={type}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
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
                    <span className="min-w-0 text-sm font-medium text-foreground">
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
