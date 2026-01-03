import { Calendar, BookOpen, ArrowRight, Library, WholeWord } from "lucide-react";
import WordCard from '../word-card';
import { Link } from "react-router-dom";
import useHome from "./hook";
import DictionaryGraph from "../knowledge-graph";

export default function Home() {
  const { dictionaryCards, loading, totalWords, totalDictionaries } = useHome();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!dictionaryCards || dictionaryCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
        <BookOpen size={64} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2">No Dictionaries Found</h2>
        <p className="text-gray-500 text-center">
          Add a dictionary to get started with your vocabulary learning journey.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto h-[calc(100vh-80px)] gap-8 bg-white">
      <div className="flex flex-col w-full">
        <div className="border-b p-4">
          <h2 className="text-3xl tracking-tighter font-bold text-black mb-3 flex items-center gap-2">
            <WholeWord size={32} strokeWidth={1.5} />
            Words of the Moment
          </h2>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 w-full divide-y divide-x border-b md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-gray-500">Total Words</p>
            <p className="text-2xl font-bold text-black">{totalWords}</p>
          </div>
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-gray-500">Dictionaries</p>
            <p className="text-2xl font-bold text-black">{totalDictionaries}</p>
          </div>
          <div className="p-3">
            <p className="text-md tracking-tight font-semibold text-gray-500">Knowledge</p>
            <p className="text-2xl font-bold text-black">{(totalWords / (totalDictionaries * 15000)).toFixed(3)}%</p>
          </div>
        </div>
        <div className="grid 2xl:grid-cols-2 grid-cols-1 w-full gap-12">
          {dictionaryCards.map((dict, dictIndex) => (
            <div key={dictIndex} className="flex flex-col w-full gap-4 p-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-3xl font-bold text-black flex items-center gap-3">
                  <Library size={32} strokeWidth={2} />
                  {dict.name}
                </h2>
                <span className="text-xs font-mono tracking-tight text-gray-500">
                  {dict.totalWords} words
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-md p-4 rounded-2xl outline outline-gray-200">
                <div className="flex flex-col min-h-0">
                  <WordCard word={dict.wordOfTheDay} />
                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      to={`/dictionary?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      className="flex-1 flex items-center justify-center rounded-2xl gap-2 p-2 text-sm font-semibold bg-black text-white hover:!text-white hover:bg-gray-800 transition-colors"
                    >
                      <BookOpen size={16} />
                      View Dictionary
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={`/translation?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      className="flex-1 flex items-center justify-center rounded-2xl gap-2 p-2 text-sm font-semibold border-2 border-black text-black hover:bg-black hover:!text-white transition-colors"
                    >
                      Practice
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  <h3 className="text-sm tracking-tighter font-semibold italic text-gray-600 mt-6 border-t-dotted border-t border-gray-200 pt-2">
                    Recent words added to this dictionary
                  </h3>
                  <div className="flex flex-col gap-2 mt-1">
                    {dict.recentWords.map((word: any, wordIndex: number) => (
                      <WordCard
                        key={wordIndex}
                        word={{ ...word, definitions: undefined }}
                        route={dict.path}
                        name={dict.id}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-[400px] border rounded-xl lg:h-auto min-h-0">
                  <DictionaryGraph
                    title={dict.name}
                    name={dict.id}
                    route={dict.path}
                    doubleView={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
