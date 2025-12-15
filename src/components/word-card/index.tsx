import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useWordCard from "./hook";
import { useNavigate } from "react-router-dom";
import { useConfigStore } from "@/context/dictionary-context";
import EditWordModal from "../dict/edit-word-modal";

export default function WordCard({ word, route, name, doubleView}: { word: any, route?: string; name?: string; doubleView?: boolean }) {
  const {
    pairs,
    pairIdx,
    setPairIdx,
    original,
    translations,
    gender,
    number,
    definitions,
    originalWithArticle
  } = useWordCard(word);

  const navigate = useNavigate();
  const setSelectedWord = useConfigStore((state: any) => state.setSelectedWord);
  const isFlipped = useConfigStore((state) => state.isFlipped);

  return (
    <div className="">
      <div className="flex items-start justify-between">
        <div onClick={() => {
          setSelectedWord(word);
          if (doubleView) { return };
          navigate(
            `/markdown?path=${encodeURIComponent(route || "")}&name=${encodeURIComponent(name || "")}`,
          );
        }} className="flex flex-wrap gap-1 items-center">
          <h3 className={`text-xl cursor-pointer tracking-tight font-bold text-gray-900 ${name && route ? "cursor-pointer" : ""} `}>
            {isFlipped ? translations : originalWithArticle}
          </h3>
          <p className="text-2xl">⇔</p>
          <p className="italic mt-1">{isFlipped ? originalWithArticle : translations}</p>
        </div>
        {name && route && <EditWordModal word={word} route={route} name={name}></EditWordModal>}
      </div>
      <div className="flex flex-wrap justify-between mt-2 mb-2">
        <p className="text-gray-400 text-sm">
          <b>{word?.type}, </b>
          {gender}., {number}.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="flex flex-row items-center gap-2 text-gray-400 text-xs">
            <Calendar size={12} /> {word?.dateAdded}
          </span>
          {pairs.length > 1 && (
            <div className="flex flex-row gap-2 justify-center items-center">
              <button
                onClick={() => setPairIdx((idx: number) => Math.max(0, idx - 1))}
                disabled={pairIdx === 0}
                className="rounded border cursor-pointer border-gray-300 bg-white text-black disabled:opacity-50"
                title="Previous pair"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs">{pairIdx + 1} / {pairs.length}</span>
              <button
                onClick={() => setPairIdx((idx: number) => Math.min(pairs.length - 1, idx + 1))}
                disabled={pairIdx === pairs.length - 1}
                className="rounded border cursor-pointer border-gray-300 bg-white text-black disabled:opacity-50"
                title="Next pair"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <hr className="mb-2" />

      {definitions?.map((definition: string, index: number) => (
        <div className="text-sm" key={index}>
          <sup>{index + 1}</sup> {definition}
        </div>
      ))}
    </div>
  );
}
