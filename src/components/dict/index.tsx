import { ChevronLeft, ChevronRight, Calendar, MoreVertical, Book, Search } from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";
import useTranslationHooks from "./hook";
import AddWordModal from "./add-word-modal";
import AddDictModal from "./add-dict-modal";
import EditWordModal from "./edit-word-modal";


export default function DictionaryComponent() {
  const {
    selectedLetter,
    currentPage,
    alphabet,
    totalPages,
    paginatedWords,
    handlePrevPage,
    handleNextPage,
    handleLetterClick,
    scrollRef } = useTranslationHooks();

  const leftColumn = paginatedWords.filter((_, idx) => idx % 2 === 0);
  const rightColumn = paginatedWords.filter((_, idx) => idx % 2 === 1);

  const WordCard = ({ word, isLeft }: { word: TranslationEntry, isLeft: boolean }) => (
    <div className={`p-2 ${isLeft ? "mr-2" : "ml-2"}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-2xl font-bold text-gray-900">{word.original}</h3>
          <p className="text-2xl">⇔</p>
          <p className="italic mt-1">{word.translation}</p>
        </div>
        <EditWordModal word={word}></EditWordModal>
      </div>
      <div className="flex flex-row justify-between">
        <p className="text-gray-400 text-sm pb-1">
          <b>{word?.type}, </b>
          {word?.gender}., {word?.number}.
        </p>
        <span className="flex flex-row items-center align-center gap-2 text-gray-400 text-sm">
          <Calendar size="14"></Calendar> {word?.dateAdded}{" "}
        </span>
      </div>
      <hr className="mb-2"></hr>
      {word.definitions.map((definition: string, index: number) => (
        <div key={index + ""} className="">
          <sup>{index + 1}</sup> {definition}.
        </div>
      ))}

      {word.observations && (
        <p className="text-gray-600 italic text-xs mt-2">{word.observations}</p>
      )}
    </div>
  );
  return (
    <div>
      <div className="bg-background flex justify-between items-center h-16 border-b p-4">
        <div className="flex flex-row gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a word"
              className="w-full border-2 border-gray-300 py-1 pl-10 pr-4 rounded-lg text-gray-700 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-4">
            <AddWordModal></AddWordModal>
            <AddDictModal></AddDictModal>
            <div className="bg-gray-100 flex flex-row items-center py-2 rounded-xl px-2 gap-2">
              <Book size={16} />
              <p className="text-sm">German</p>
              <MoreVertical size={18} className="ml-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row-reverse overflow-hidden h-[calc(100vh-130px)]">
        <div className="border-r flex flex-col items-center divide-y overflow-y-auto h-full flex-shrink-0">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0 ${selectedLetter === letter
                ? "bg-blue-600 text-black"
                : "text-gray-400 hover:text-black"
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col px-4 py-2 min-w-0 h-full">
          <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
            {currentPage <= 1 && (
              <div className="mb-2 flex-shrink-0">
                <p className="text-8xl font-bold text-gray-900 mb-4">
                  {selectedLetter}
                </p>
                <hr />
              </div>
            )}
            {paginatedWords.length === 0 ? (
              <div className="py-12 text-gray-500 text-center">
                No list found starting with "{selectedLetter}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                <div className="space-y-4">
                  {leftColumn.map((word, idx) => (
                    <WordCard key={`left-${idx}`} word={word} isLeft={true} />
                  ))}
                </div>

                <div className="space-y-4">
                  {rightColumn.map((word, idx) => (
                    <WordCard key={`right-${idx}`} word={word} isLeft={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-center gap-4 my-2 pt-4 border-t border-gray-200 bg-white">
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
      </div>
    </div>
  );
}
