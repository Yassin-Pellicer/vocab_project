import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useWordCard from "./hook";
import { useNavigate } from "react-router-dom";
import { useConfigStore } from "@/context/dictionary-context";
import EditWordModal from "../dict/edit-word-modal";

export default function WordCard({ word, route, name }: { word: any, route?: string; name?: string }) {
  const {
    pairs,
    pairIdx,
    setPairIdx,
    original,
    translations,
    gender,
    number,
    definitions,
  } = useWordCard(word);

  const navigate = useNavigate();
  const setSelectedWord = useConfigStore((state: any) => state.setSelectedWord);
  const isFlipped = useConfigStore((state) => state.isFlipped);

  return (
    <div className="">
      <div className="flex items-start justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h3 className={`text-3xl font-bold text-gray-900 ${name && route ? "cursor-pointer" : ""} `}
            onClick={() => {
              if (!route || !name) return;
              setSelectedWord(word);
              navigate(
                `/markdown?path=${encodeURIComponent(route || "")}&name=${encodeURIComponent(name || "")}`,
              );
            }}>
            {isFlipped ? translations : original}
          </h3>
          <p className="text-2xl">⇔</p>
          <p className="italic mt-1">{isFlipped ? original : translations}</p>
        </div>
        {name && route && <EditWordModal word={word} route={route} name={name}></EditWordModal>}
      </div>
      <div className="flex flex-row justify-between mt-2 mb-2">
        <p className="text-gray-400 text-sm">
          <b>{word?.type}, </b>
          {gender}., {number}.
        </p>
        <div className="flex flex-row mb-2 gap-6 items-center">
          <span className="flex flex-row items-center gap-2 text-gray-400 text-sm">
            <Calendar size={12} /> {word?.dateAdded}
          </span>
          {pairs.length > 1 && (
            <div className="flex flex-row gap-2 justify-center items-center">
              <button
                onClick={() => setPairIdx((idx: number) => Math.max(0, idx - 1))}
                disabled={pairIdx === 0}
                className="p-1 rounded border border-gray-300 bg-white text-black disabled:opacity-50"
                title="Previous pair"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs">{pairIdx + 1} / {pairs.length}</span>
              <button
                onClick={() => setPairIdx((idx: number) => Math.min(pairs.length - 1, idx + 1))}
                disabled={pairIdx === pairs.length - 1}
                className="p-1 rounded border border-gray-300 bg-white text-black disabled:opacity-50"
                title="Next pair"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <hr className="mb-3" />

      {definitions.slice(0, 3).map((definition: string, index: number) => (
        <div key={index}>
          <sup>{index + 1}</sup> {definition}
        </div>
      ))}
      {definitions.length > 3 && (
        <p className="text-xs text-gray-400 italic mt-1 ml-4">
          +{definitions.length - 3} more definitions
        </p>
      )}
    </div>
  );
}
