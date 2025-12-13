import { ChevronLeft, ChevronRight, Search, X, ArrowLeftRight, ListOrdered, SquareSplitHorizontal } from "lucide-react";
import useTranslationHooks from "./hook";
import WordCard from "../word-card";
import Markdown from "@/components/markdown-display";
import useConfigStore from "@/context/dictionary-context";

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
    scrollRef,
    isFlipped,
    setIsFlipped,
    isAdditionOrder,
    setIsAdditionOrder,
    dualView,
    setDualView } = useTranslationHooks({ route, name });

  const selectedWord = useConfigStore((state: any) => state.selectedWord);
  const leftColumn = paginatedWords.filter((_, idx) => idx % 2 === 0);
  const rightColumn = paginatedWords.filter((_, idx) => idx % 2 === 1);

  return (
    <div>
      <div className="bg-background flex justify-between items-center h-16 border-b pr-4 pl-1">
        <div className="flex flex-row gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder="Search for a word"
              className="w-full text-sm pl-14 pr-14 text-gray-700 focus:outline-none focus:border-blue-400 transition duration-150 ease-in-out"
            />
            {searchField && <X onClick={() => { setSearchField("") }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-2">
            <button
              onClick={() => setDualView(!dualView)}
              className={`p-2 rounded-2xl border transition-colors ${dualView
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              title="Flip translations"
            >
              <SquareSplitHorizontal size={18} />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className={`p-2 rounded-2xl border transition-colors ${isFlipped
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              title="Show in addition order"
            >
              <ListOrdered size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-row-reverse overflow-hidden h-[calc(100vh-130px)]">
        {dualView && selectedWord && <div className="max-w-[50%] w-full">
          <Markdown route={`${route.replace(/\\/g, "/")}/MD-${name}`} name={selectedWord.uuid} word={selectedWord}></Markdown>
        </div>}

        <div className="flex-1 flex flex-col border-r min-w-0 h-full">
          <div className="flex flex-col overflow-auto px-2 pt-4" ref={scrollRef}>
            {currentPage <= 1 && (
              <div className={`mb-4 mx-2 flex-shrink-0 ${(searchField || isAdditionOrder) ? "hidden" : ""}`} >
                <p className="text-8xl font-bold text-gray-900 mb-4">
                  {selectedLetter}
                </p>
                <hr />
              </div>
            )}
            {paginatedWords.length === 0 ? (
              <div className="py-12 text-gray-500 text-center">
                {searchField ? `No results found for "${searchField}"` : `No list found starting with ${selectedLetter}`}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 pb-8">
                <div className="sm:pl-2 px-2">
                  {leftColumn.map((word, idx) => (
                    <div className="shadow-md p-4 mb-4 rounded-2xl outline outline-gray-200">
                      <WordCard key={`left-${idx}-${word.uuid}`} word={word} route={route} name={name} doubleView={dualView} />
                    </div>
                  ))}
                </div>
                <div className="sm:pr-2 px-2">
                  {rightColumn.map((word, idx) => (
                    <div className="shadow-md mb-4 p-4 rounded-2xl outline outline-gray-200">
                      <WordCard key={`left-${idx}-${word.uuid}`} word={word} route={route} name={name} doubleView={dualView} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-center gap-4 my-4 pt-4 border-t border-gray-200 bg-white">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className=" flex border-l flex-col border-r items-center divide-y overflow-y-auto h-full flex-shrink-0">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0 ${selectedLetter === letter
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-black"
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
