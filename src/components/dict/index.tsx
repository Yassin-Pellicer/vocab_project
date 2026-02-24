import { ChevronLeft, ChevronRight, Search, X, ArrowLeftRight, ListOrdered, SquareSplitHorizontal, Filter, TreesIcon } from "lucide-react";
import useTranslationHooks from "./hook";
import AddWordModal from "./add-word-modal";
import AddDictModal from "./add-dict-modal";
import WordCard from "../word-card";
import Markdown from "@/components/markdown-display";
import { useConfigStore } from "@/context/dictionary-context";
import { useState, useRef, useEffect } from "react";
import KnowledgeGraph from "../knowledge-graph";

const getGridClasses = (dualView: boolean): string => {
  if (dualView) {
    return "grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-4 pb-8 sm:pl-2 px-2 gap-4";
  }
  return "grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 pb-8 sm:pl-2 px-2 gap-4";
};

export default function DictionaryComponent({ route, name }: { route: string, name: string }): JSX.Element {

  const {
    selectedLetter,
    setSelectedLetter,
    currentPage,
    setCurrentPage,
    alphabet,
    totalPages,
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
    dualView,
    setDualView,
    graphMode,
    setGraphMode,
    availableTypes } = useTranslationHooks({ route, name });

  const selectedWord = useConfigStore((state: any) => state.selectedWord);
  const selectedTypes = useConfigStore((state: any) => state.selectedTypes);
  const toggleType = useConfigStore((state: any) => state.toggleType);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div className="bg-background flex justify-between items-center h-16 border-b pr-4 pl-1">
        <div className="flex flex-row gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder="Search for a word"
              className="w-full text-sm pl-14 pr-14 bg-transparent h-9 focus:outline-none"
            />
            {searchField && <X onClick={() => { setSearchField("") }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" />}
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-2">
            <div className="relative" ref={typeMenuRef}>
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className={`p-2 rounded-2xl border transition-colors relative ${selectedTypes.length > 0
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
              {showTypeMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {availableTypes.length === 0 ? (
                      <div className="px-4 py-1 text-sm text-gray-500">No types available</div>
                    ) : (
                      availableTypes.map((type) => (
                        <label
                          key={type}
                          className="flex items-center px-2 py-0.5 hover:bg-gray-100 mx-1 rounded-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="mr-2 w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setDualView(!dualView)}
              className={`p-2 rounded-2xl border transition-colors ${dualView
                ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                : "bg-card text-card-foreground border-border hover:bg-popover"
                }`}
              title="Toggle dual view"
            >
              <SquareSplitHorizontal size={18} />
            </button>
            <button
              onClick={() => setGraphMode(!graphMode)}
              className={`p-2 rounded-2xl border transition-colors ${graphMode
                ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                : "bg-card text-card-foreground border-border hover:bg-popover"
                }`}
              title="Toggle graph mode"
            >
              <TreesIcon size={18} />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className={`p-2 rounded-2xl border transition-colors ${isFlipped
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
              className={`p-2 rounded-2xl border transition-colors ${isAdditionOrder
                ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                : "bg-card text-card-foreground border-border hover:bg-popover"
                }`}
              title="Show in addition order"
            >
              <ListOrdered size={18} />
            </button>
            <AddWordModal ref={addWordButtonRef} route={route} name={name}></AddWordModal>
          </div>
        </div>
      </div>
      <div className="flex flex-row-reverse overflow-hidden h-[calc(100vh-130px)]">
        {dualView && selectedWord && <div className="max-w-[50%] w-full">
          <Markdown route={route} name={name} uuid={selectedWord.uuid} word={selectedWord}></Markdown>
        </div>}
        {!graphMode ? (
          <>
            <div className="flex-1 flex flex-col border-r min-w-0 h-full">
              <div className="flex flex-col overflow-auto px-2 pt-4" ref={scrollRef}>
                {currentPage <= 1 && (
                  <div className={`mb-4 mx-2 flex-shrink-0 ${(searchField || isAdditionOrder) ? "hidden" : ""}`} >
                    <p className="text-8xl font-bold text-foreground mb-4">
                      {selectedLetter}
                    </p>
                    <hr className="border-border" />
                  </div>
                )}
                {paginatedWords.length === 0 ? (
                  <div className="py-12 text-gray-500 text-center">
                    {searchField ? `No results found for "${searchField}"` : `No list found starting with ${selectedLetter}`}
                  </div>
                ) : (
                  <div className={getGridClasses(dualView)}>
                    {paginatedWords.map((word, idx) => (
                      <div key={`left-${idx}-${word.uuid}`} className="shadow-md p-4 mb-4 rounded-2xl border border-border bg-card text-card-foreground">
                        <WordCard word={word} route={route} name={name} doubleView={dualView} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
                {totalPages > 1 && (
                <div className="flex-shrink-0 mt-auto mb-4 flex items-center justify-center gap-4 my-4 pt-4 border-t border-border bg-background">
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
            <div className=" flex flex-col border-r items-center divide-y overflow-y-auto h-full flex-shrink-0">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0 ${selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-popover"
                    }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </>) :
          <div className="border-r">
            <KnowledgeGraph route={route} name={name} title={""} doubleView={dualView} />
          </div>
        }
      </div>
    </div>
  );
}