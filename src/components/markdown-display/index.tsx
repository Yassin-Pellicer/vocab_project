import { useMarkdown } from "./hook";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github.css";
import EditWordModal from "../dict/edit-word-modal";
import { Calendar } from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";

export default function MarkdownRenderer({ route, name, word }: { route: string; name: string, word: TranslationEntry }) {
  const { markdown } = useMarkdown(route, name);

  return (
    <div className="flex overflow-y-auto h-[calc(100vh-100px)] flex-col max-w-[800px] mx-auto mt-4 p-4 !pr-8">
      <div className="pb-4 w-full">
        <div className="flex items-start justify-between">
          <div className="flex flex-row gap-2 items-center">
            <h3 className="text-4xl font-bold text-gray-900">{word.original}</h3>
            <p className="text-4xl">⇔</p>
            <p className="italic mt-1 text-2xl">{word.translation}</p>
          </div>
          {/* <EditWordModal word={word} route={route} name={name}></EditWordModal> */}
        </div>
        <div className="flex flex-row justify-between">
          <p className="text-gray-400 text-lg pb-1 mt-1">
            <b>{word?.type}, </b>
            {word?.gender}., {word?.number}.
          </p>
          <span className="flex flex-row items-center align-center gap-2 text-gray-400 text-lg">
            <Calendar size="14"></Calendar> {word?.dateAdded}{" "}
          </span>
        </div>
        <hr className="mb-2"></hr>
        {word.definitions.map((definition: string, index: number) => (
          <div key={index + ""} className="text-xl">
            <sup>{index + 1}</sup> {definition}.
          </div>
        ))}
        {word.observations && (
          <p className="text-gray-600 italic text-md mt-2 ">{word.observations}</p>
        )}
      </div>
      <div className="markdown border-l border-gray-300 px-6 ">
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};