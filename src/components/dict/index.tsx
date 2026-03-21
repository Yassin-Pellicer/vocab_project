import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ArrowLeftRight,
  ListOrdered,
  Filter,
  TreesIcon,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import useTranslationHooks from "./hook";
import AddWordModal from "./add-word-modal";
import WordCard from "../word-card";
import Markdown from "@/components/markdown-display";
import { useConfigStore } from "@/context/dictionary-context";
import KnowledgeGraph from "../knowledge-graph";
import { useDictionaryKeybinds } from "./keybinds";

const getGridClasses = (): string => {
  return `
    grid 
    [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]
    pb-8 sm:pl-2 px-2 gap-4
  `;
};

export default function DictionaryComponent({
  route,
  name,
}: {
  route: string;
  name: string;
}): JSX.Element {
  const {
    selectedLetter,
    setSelectedLetter,
    currentPage,
    setCurrentPage,
    alphabet,
    totalPages,
    filteredWords,
    paginatedWords,
    handlePrevPage,
    handleNextPage,
    handleLetterClick,
    searchField,
    setSearchField,
    searchRef,
    addWordButtonRef,
    scrollRef,
    isFlipped,
    setIsFlipped,
    isAdditionOrder,
    setIsAdditionOrder,
    graphMode,
    setGraphMode,
    availableTypes,
    splitViewWidth,
    splitViewCollapsed,
    handleResizeSplitView,
    containerRef,
    alphabetRef,
  } = useTranslationHooks({ route, name });

  useDictionaryKeybinds({
    searchField,
    setSearchField,
    searchRef,
    addWordButtonRef,
    filteredWords,
    paginatedWords,
    handleLetterClick,
  });

  const selectedWord = useConfigStore((state) => state.selectedWord);
  const selectedTypes = useConfigStore((state) => state.selectedTypes);
  const toggleType = useConfigStore((state) => state.toggleType);

  return (
    <div>
      <div className="bg-background flex justify-between items-center h-16 border-b pr-4 pl-1">
        <div className="flex flex-row gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="text"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder="Search for a word"
              className="w-full text-sm pl-14 pr-14 bg-transparent h-9 focus:outline-none"
            />
            {searchField && (
              <X
                onClick={() => setSearchField("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              />
            )}
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`p-2 rounded-2xl border transition-colors relative ${
                    selectedTypes.length > 0
                      ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                      : "bg-card text-card-foreground border-border hover:bg-popover"
                  }`}
                  title="Filter by type"
                >
                  <Filter size={18} />
                  {selectedTypes.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedTypes.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-fit p-1">
                <div className="py-1">
                  {availableTypes.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No types available
                    </div>
                  ) : (
                    availableTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center px-2 py-0.5 hover:bg-muted/10 rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">{type}</span>
                      </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <button
              onClick={() => setGraphMode(!graphMode)}
              className={`p-2 rounded-2xl border transition-colors ${
                graphMode
                  ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  : "bg-card text-card-foreground border-border hover:bg-popover"
              }`}
              title="Toggle graph mode"
            >
              <TreesIcon size={18} />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className={`p-2 rounded-2xl border transition-colors ${
                isFlipped
                  ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  : "bg-card text-card-foreground border-border hover:bg-popover"
              }`}
              title="Flip translations"
            >
              <ArrowLeftRight size={18} />
            </button>
            <button
              onClick={() => {
                setIsAdditionOrder(!isAdditionOrder);
                if (!isAdditionOrder) {
                  setSelectedLetter("");
                } else {
                  setSelectedLetter("A");
                }
                setCurrentPage(1);
              }}
              className={`p-2 rounded-2xl border transition-colors ${
                isAdditionOrder
                  ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  : "bg-card text-card-foreground border-border hover:bg-popover"
              }`}
              title="Show in addition order"
            >
              <ListOrdered size={18} />
            </button>
            <AddWordModal ref={addWordButtonRef} route={route} name={name} />
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex flex-row-reverse overflow-hidden h-[calc(100vh-130px)] min-h-0"
      >
        {splitViewCollapsed ? (
          <div className="shrink-0 relative" style={{ width: 8 }}>
            <div
              role="separator"
              aria-orientation="vertical"
              title="Drag to expand"
              onPointerDown={handleResizeSplitView}
              className="absolute left-0 top-0 h-full w-2 cursor-col-resize bg-muted/20 hover:bg-muted/40"
            />
          </div>
        ) : (
          <div
            className="flex flex-col relative shrink-0 min-h-0"
            style={{
              width: splitViewWidth,
            }}
          >
            <div
              role="separator"
              aria-orientation="vertical"
              title="Drag to resize"
              onPointerDown={handleResizeSplitView}
              className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-muted/20 z-10"
            />
            <div className="flex-1 overflow-y-auto min-h-0">
              {selectedWord ? (
                <Markdown
                  route={route}
                  name={name}
                  uuid={selectedWord.uuid}
                  word={selectedWord}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a word to view details
                </div>
              )}
            </div>
          </div>
        )}

        {!graphMode ? (
          <>
            <div className="flex-1 flex flex-col border-r min-w-0 h-full min-h-0">
              <div
                className="flex flex-col overflow-auto px-2 pt-4 min-h-0"
                ref={scrollRef}
              >
                {currentPage <= 1 && (
                  <div
                    className={`mb-4 mx-2 shrink-0 ${
                      searchField || isAdditionOrder ? "hidden" : ""
                    }`}
                  >
                    <p className="text-8xl font-bold text-foreground mb-4">
                      {selectedLetter}
                    </p>
                    <hr className="border-border" />
                  </div>
                )}
                {paginatedWords.length === 0 ? (
                  <div className="py-12 text-gray-500 text-center">
                    {searchField
                      ? `No results found for "${searchField}"`
                      : `No list found starting with ${selectedLetter}`}
                  </div>
                ) : (
                  <div className={getGridClasses()}>
                    {paginatedWords.map((word, idx) => (
                      <div
                        key={`left-${idx}-${word.uuid}`}
                        className="shadow-md p-4 mb-4 rounded-2xl border bg-card text-card-foreground"
                      >
                        <WordCard word={word} route={route} name={name} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="shrink-0 mt-auto mb-4 flex items-center justify-center gap-4 my-4 pt-4 border-t border-border bg-background">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-popover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-muted-foreground font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-popover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div
              ref={alphabetRef}
              className="flex flex-col border-r items-center divide-y overflow-y-auto hide-scrollbar h-full shrink-0"
            >
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                    selectedLetter === letter
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-popover"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="border-r w-full">
            <KnowledgeGraph
              route={route}
              name={name}
              title={""}
              doubleView={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
