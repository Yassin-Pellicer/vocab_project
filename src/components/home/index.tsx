// Updated Home component with Word of the Moment styled like WordCard

import { Calendar, BookOpen, ArrowRight, Library, Clock, WholeWord } from "lucide-react";
import { Link } from "react-router-dom";
import useHome from "./hook";

export default function Home() {
  const { dictionaries, loading, totalWords, totalDictionaries } = useHome();

  const WordCard = ({ word }: { word: any }) => (
    <div className="">
      <div className="flex items-start justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3
            className="text-3xl font-bold text-gray-900 cursor-pointer"
          >
            {word.translation}
          </h3>
          <p className="text-2xl">⇔</p>
          <p className="italic mt-1 text-xl">{word.original}</p>
        </div>
      </div>

      <div className="flex flex-row justify-between mt-2 mb-2">
        <p className="text-gray-400 text-sm pb-1">
          <b>{word?.type}, </b>
          {word?.gender}., {word?.number}.
        </p>
        <span className="flex flex-row items-center gap-2 text-gray-400 text-sm">
          <Calendar size={12} /> {word?.dateAdded}
        </span>
      </div>

      <hr className="mb-3" />

      {word.definitions.slice(0, 3).map((definition: string, index: number) => (
        <div key={index}>
          <sup>{index + 1}</sup> {definition}.
        </div>
      ))}

      {word.definitions.length > 3 && (
        <p className="text-xs text-gray-400 italic mt-1 ml-4">
          +{word.definitions.length - 3} more definitions
        </p>
      )}

      {word.observations && (
        <p className="text-gray-600 italic text-xs mt-3">{word.observations}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  if (!dictionaries || dictionaries.length === 0) {
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
    <div className="flex flex-col pt-6 mb-4 overflow-y-auto h-[calc(100vh-80px)] gap-8 bg-white">
      <div className="flex flex-col w-full">
        <div className="pb-8 border-b px-8">
          <h1 className="text-6xl font-bold text-black mb-3 flex items-center gap-4">
            <WholeWord size={64} strokeWidth={1.5} />
            Words of the Moment
          </h1>
          <p className="text-gray-500 text-lg flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full divide-y divide-x border-b md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-8">
            <p className="text-md font-semibold mb-2 text-gray-500">Total Words</p>
            <p className="text-5xl font-bold text-black">{totalWords}</p>
          </div>
          <div className="p-8">
            <p className="text-md font-semibold mb-2 text-gray-500">Dictionaries</p>
            <p className="text-5xl font-bold text-black">{totalDictionaries}</p>
          </div>
          <div className="p-8">
            <p className="text-md font-semibold mb-2 text-gray-500">Knowledge</p>
            <p className="text-5xl font-bold text-black">{(totalWords / (totalDictionaries * 15000)).toFixed(3)}%</p>
          </div>
        </div>

        <div className="grid xl:grid-cols-2 grid-cols-1 w-full space-y-12">
          {dictionaries.map((dict, dictIndex) => (
            <div key={dictIndex} className="w-full p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h2 className="text-3xl font-bold text-black flex items-center gap-3">
                  <Library size={32} strokeWidth={2} />
                  {dict.name}
                </h2>
                <span className="text-sm font-mono text-gray-500">{dict.totalWords} words</span>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col h-full">
                  <WordCard word={dict.wordOfTheDay} />

                  <div className="flex 2xl:flex-row flex-col gap-3 mt-4">
                    <Link
                      to={`/dictionary?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      className="flex-1 flex items-center justify-center rounded-2xl gap-2 px-6 py-4 text-sm font-semibold bg-gray-700 text-white hover:!text-white hover:bg-gray-800 transition-colors"
                    >
                      <BookOpen size={16} />
                      View Dictionary
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={`/translation?name=${encodeURIComponent(dict.id)}&path=${encodeURIComponent(dict.path)}`}
                      className="flex-1 flex items-center justify-center rounded-2xl gap-2 px-6 py-4 text-sm font-semibold border-2 border-black text-black hover:bg-black hover:!text-white transition-colors"
                    >
                      Practice
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Recently Added */}
                <div className="">
                  <h4 className="text-xl  font-semibold mb-4 text-gray-500 flex items-center gap-2">
                    <Clock size={18} />
                    Recently Added
                  </h4>
                  <div className="space-y-1">
                    {dict.recentWords.length > 0 ? (
                      dict.recentWords.map((word, index) => (
                        <div key={index} className="pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                          <div className="flex flex-row gap-1 items-center align-center">
                            <p className="font-bold text-lg text-black">{word.translation}</p>
                            <p className="text-lg">⇔</p>
                            <p className="italic text-md">{word.original}</p>
                          </div>
                          {word.definitions.slice(0, 1).map((definition: string, index: number) => (
                            <div key={index}>
                              <sup>{index + 1}</sup> {definition}.
                            </div>
                          ))}
                          <p className="text-xs font-mono text-gray-400 flex mt-1 items-center gap-1">
                            <Calendar size={10} />
                            {word.dateAdded}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-8">No recent words</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
