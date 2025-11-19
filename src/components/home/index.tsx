import { Calendar, BookOpen, ArrowRight, TrendingUp, Library, Clock, Sparkles, WholeWord } from "lucide-react";
import { Link } from "react-router-dom";
import useHome from "./hook";

export default function Home() {
  const {
    dictionaries,
    loading,
    totalWords,
    totalDictionaries,
  } = useHome();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!dictionaries || dictionaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
        <BookOpen size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Dictionaries Found
        </h2>
        <p className="text-gray-500 text-center">
          Add a dictionary to get started with your vocabulary learning journey.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-6 overflow-y-auto h-[calc(100vh-80px)] gap-4 pb-16">
      <div className="flex flex-col w-full items-center px-8">
        <div className="text-center mb-6 max-w-[1200px] py-8">
          <h1 className="underline text-5xl font-bold italic text-gray-900 mb-2 flex items-center justify-center gap-3">
            <WholeWord size={68} />
            Words of the Moment
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-x divide-x w-full">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Total Words</p>
                <p className="text-3xl font-bold text-blue-900">{totalWords}</p>
              </div>
              <BookOpen className="text-blue-400" size={40} />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Dictionaries</p>
                <p className="text-3xl font-bold text-purple-900">{totalDictionaries}</p>
              </div>
              <Library className="text-purple-400" size={40} />
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Knowledge earned</p>
                <p className="text-3xl font-bold text-green-900">{(totalWords / (totalDictionaries * 15000)).toFixed(6)} %</p>
              </div>
              <TrendingUp className="text-green-400" size={40} />
            </div>
          </div>
        </div>

        <div className="grid 2xl:grid-cols-2 border-x w-fit border-b rounded-b-2xl">
          {dictionaries.map((dict, dictIndex) => (
            <div key={dictIndex} className="w-full flex flex-col justify-center items-center p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Library className="text-blue-600" size={28} />
                {dict.name}
                <span className="text-sm font-normal text-gray-500 ml-2">({dict.totalWords} words)</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 h-full w-full gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border shadow-sm border-gray-200 p-6">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                        <Sparkles size={12} className="text-yellow-500" />
                        Word of the Moment
                      </p>
                      <div className="flex flex-row gap-3 items-center mb-2">
                        <h3 className="text-4xl font-bold text-gray-900">
                          {dict.wordOfTheDay?.translation}
                        </h3>
                        <p className="text-3xl text-gray-400">⇔</p>
                        <p className="italic text-3xl text-blue-600">
                          {dict.wordOfTheDay?.original}
                        </p>
                      </div>
                      <p className="text-gray-500 text-xs">
                        <span className="font-semibold text-gray-700">{dict.wordOfTheDay?.type}</span>
                        {dict.wordOfTheDay?.gender && `, ${dict.wordOfTheDay.gender}`}
                        {dict.wordOfTheDay?.number && ` · ${dict.wordOfTheDay.number}`}
                      </p>
                    </div>

                    <hr className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Definitions</h4>
                      {dict.wordOfTheDay?.definitions.slice(0, 3).map(
                        (definition: string, index: number) => (
                          <div key={index} className="text-sm text-gray-700 flex gap-2">
                            <span className="font-bold text-blue-600 flex-shrink-0">{index + 1}.</span>
                            <span>{definition}</span>
                          </div>
                        )
                      )}
                      {dict.wordOfTheDay && dict.wordOfTheDay.definitions.length > 3 && (
                        <p className="text-xs text-gray-400 italic">+{dict.wordOfTheDay.definitions.length - 3} more...</p>
                      )}
                    </div>

                    {dict.wordOfTheDay?.observations && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                          💡 {dict.wordOfTheDay.observations}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-gray-200">
                      <Link
                        to={`/dictionary?name=${encodeURIComponent(
                          dict.id
                        )}&path=${encodeURIComponent(dict.path)}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all shadow-sm hover:shadow-md"
                      >
                        <BookOpen size={16} />
                        View Dictionary
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        to={`/translation?name=${encodeURIComponent(
                          dict.id
                        )}&path=${encodeURIComponent(dict.path)}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
                      >
                        Practice
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-blue-600" />
                      Recently Added
                    </h4>
                    <div className="space-y-3">
                      {dict.recentWords.length > 0 ? (
                        dict.recentWords.map((word, index) => (
                          <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <p className="font-semibold text-gray-900 text-sm">{word.original}</p>
                            <p className="text-xs text-blue-600 mb-1">{word.translation}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {word.dateAdded}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-4">No recent words</p>
                      )}
                    </div>
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
