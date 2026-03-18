import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useWordCard from "./hook";
import { useConfigStore } from "@/context/dictionary-context";
import EditWordModal from "../dict/edit-word-modal";
import type { TranslationEntry } from "@/types/translation-entry";

export default function WordCard({
  word,
  route,
  name,
}: {
  word: TranslationEntry;
  route?: string;
  name: string;
}) {
  const {
    pairs,
    pairIdx,
    setPairIdx,
    translations,
    gender,
    number,
    definitions,
    originalWithArticle
  } = useWordCard(name, word);

  const setSelectedWord = useConfigStore((state) => state.setSelectedWord);
  const isFlipped = useConfigStore((state) => state.isFlipped);

  return (
    <div className="">
      <div className="flex items-start justify-between">
        <div
          onClick={() => setSelectedWord(word)}
          className="flex flex-wrap gap-1 items-center">
          <h3 className={`text-xl cursor-pointer tracking-tight font-bold text-foreground ${name && route ? "cursor-pointer" : ""} `}>
            {isFlipped ? translations : originalWithArticle}
          </h3>
          <p className="text-2xl">⇔</p>
          <p className="italic text-muted-foreground">{isFlipped ? originalWithArticle : translations}</p>
        </div>
        {route && <EditWordModal word={word} route={route} name={name} />}
      </div>
      <div className="flex flex-wrap justify-between mt-2 mb-2">
        <p className="text-muted-foreground text-sm">
          <b>{word?.type}, </b>
          {gender}., {number}.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="flex flex-row items-center gap-2 text-muted-foreground text-xs">
            <Calendar size={12} /> {word?.dateAdded}
          </span>
          {pairs.length > 1 && (
            <div className="flex flex-row gap-2 justify-center items-center">
              <button
                onClick={() => setPairIdx((idx: number) => Math.max(0, idx - 1))}
                disabled={pairIdx === 0}
                className="rounded border cursor-pointer border-border bg-card text-card-foreground disabled:opacity-50"
                title="Previous pair"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs">{pairIdx + 1} / {pairs.length}</span>
              <button
                onClick={() => setPairIdx((idx: number) => Math.min(pairs.length - 1, idx + 1))}
                disabled={pairIdx === pairs.length - 1}
                className="rounded border cursor-pointer border-border bg-card text-card-foreground disabled:opacity-50"
                title="Next pair"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <hr className="mb-2 border-border" />

      {definitions?.map((definition: string, index: number) => (
        <div className="text-sm text-foreground" key={index}>
          <sup>{index + 1}</sup> {definition}
        </div>
      ))}
    </div>
  );
}
