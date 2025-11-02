"use client";
import useTranslationHooks from "./hook";
import { BookCheck, Calendar, Check } from "lucide-react";

export default function TranslationGame({ route, name }: { route: string, name: string }) {
  const {
    list,
    word,
    history,
    score,
    message,
    hint,
    userInput,
    setUserInput,
    lastHistoryRef,
    handleSubmit,
    showHint
  } = useTranslationHooks({ route, name });

  if (!word || Object.keys(list).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col overflow-y-auto h-[calc(100vh-130px)] gap-4 pb-16">
      <div className="flex flex-row justify-between sticky top-0 bg-white p-2 shadow-sm z-[50]">
        <p className="font-extrabold italic text-4xl ml-1">Translate!</p>
        <p className="flex flex-row gap-2 mr-2 text-xl items-center justify-center"> <BookCheck></BookCheck>{score.toFixed(2)}</p>
      </div>
      {history.length > 0 && history.map((word, _index) => (
        <div
          ref={_index === history.length - 1 ? lastHistoryRef : null}
          className={`mr-2 px-4 rounded-sm bg-gradient-to-r  ${word.status === "correct"
            ? "from-white via-white to-green-200"
            : "from-white via-white to-red-200"
            }`}>
          <div className="flex align-center justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <h3 className="text-2xl font-bold text-gray-900">{word.translation}</h3>
              <p className="text-2xl">⇔</p>
              <p className="italic mt-1">{word.original}</p>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-gray-400 text-sm pb-1">
              <b>{word?.type}, </b>
              {word?.gender}., {word?.number}.
            </p>
            <span className="flex flex-row items-center align-center gap-2 text-gray-600 text-sm">
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
          <div className="flex flex-row gap-1 align-center items-center mt-2">
            {word.message && <p className="">{word.message}</p>}
            {word.status === "correct" && word.hintsUsed ? (
              <p className="italic text-xs">
                Hints used: {word.hintsUsed}. <b>{(1 - ((1 / word.definitions.length) * word.hintsUsed)).toFixed(2)} points obtained</b>
              </p>
            ) : <p className="italic text-xs">
              Hints used: {word.hintsUsed}
            </p>}
          </div>
        </div>
      ))
      }
      <form className="px-4" onSubmit={handleSubmit}>
        <div className="flex align-center justify-between items-center ">
          <div className="flex flex-row gap-2 items-center">
            <h3 className="text-2xl font-bold text-gray-900">{word.translation}</h3>
            <p className="text-2xl">⇔</p>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the translation..."
              autoFocus
              className="mt-1 border border-gray-300 rounded-sm p-2 text-sm"
            />
            <button type="submit" className="rounded-full p-1 !bg-blue-500 text-white hover:!bg-blue-600 cursor-pointer !text-sm"><Check></Check></button>
          </div>
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
        <div className="flex flex-row gap-2 items-center mt-2">
          <button
            type="button"
            onClick={showHint}
            className="px-2 py-1 rounded !bg-yellow-200 hover:!bg-yellow-300 !text-black text-sm cursor-hover"
          >
            Hint
          </button>
          {hint && <p className="italic text-gray-600 text-sm ml-2">{hint}</p>}
        </div>
        {word.observations && (
          <p className="text-gray-600 italic text-xs mt-2">{word.observations}</p>
        )}
        {message && <p className="mt-2">{message}</p>}
      </form>
    </div>
  );
}
