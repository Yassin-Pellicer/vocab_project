// Updated Home component with Word of the Moment styled like WordCard

import { Calendar, BookOpen, ArrowRight, Library, Clock, WholeWord } from "lucide-react";
import WordCard from '../word-card';
import { Link } from "react-router-dom";
import useHome from "./hook";

export default function Home() {
  const { dictionaries, loading, totalWords, totalDictionaries } = useHome();

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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
