import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import {
  Calendar,
  Eye,
  Edit3,
  Split,
  Save,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";
import { useMarkdown } from "./hook";

export default function MarkdownEditor({
  route,
  name,
  word,
}: {
  route: string;
  name: string;
  word: TranslationEntry;
  onSave?: (markdown: string) => void;
}) {
  const {
    markdown,
    setMarkdown,
    mode,
    setMode,
    saveMarkdown,
    collapsed,
    setCollapsed,
    editorRef,
    previewRef,
    handleScroll,
  } = useMarkdown(route, name);

  return (
    <div className="flex overflow-hidden h-[calc(100vh-100px)] items-center flex-col mx-auto mt-4">
      {/* Header */}
      <div className="px-4 max-w-[800px] w-full">
        <div className="flex items-start justify-between">
          <div className="flex flex-row gap-2 items-center">
            <button
              onClick={() => { saveMarkdown(); window.history.back(); }}
              className="px-1 py-1 mt-2 hover:cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <h3 className="text-4xl font-bold text-gray-900">
              {word.original}
            </h3>
            <p className="text-4xl">⇔</p>
            <p className="italic mt-1 text-2xl">{word.translation}</p>
          </div>
        </div>
        <div className={`${collapsed ? "hidden" : "block"} mt-2`}>
          <div className="flex flex-row justify-between">
            <p className="text-gray-400 text-lg pb-1 mt-1">
              <b>{word?.type}, </b>
              {word?.gender}., {word?.number}.
            </p>
            <span className="flex flex-row items-center gap-2 text-gray-400 text-lg">
              <Calendar size="14" /> {word?.dateAdded}
            </span>
          </div>
          <hr className="my-2" />
          {word.definitions.map((definition: string, index: number) => (
            <div key={index} className="text-xl">
              <sup>{index + 1}</sup> {definition}.
            </div>
          ))}
          {word.observations && (
            <p className="text-gray-600 italic text-md mt-2">
              {word.observations}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-between mt-4">
          <div className="flex flex-row justify-between mt-4">
            <div className="flex flex-row gap-2 text-sm">
              <button
                onClick={() => setMode("edit")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${
                  mode === "edit"
                    ? "!bg-black text-white"
                    : "transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
                } `}
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => setMode("split")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${
                  mode === "split"
                    ? "!bg-black text-white"
                    : "transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
                } `}
              >
                <Split size={16} />
                Split
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${
                  mode === "preview"
                    ? "!bg-black text-white"
                    : "transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
                } `}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
            <button
              onClick={saveMarkdown}
              className="px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
            >
              <Save size={16} />
              Save
            </button>
          </div>
          <div className="flex justify-center">
            <button onClick={() => setCollapsed(!collapsed)} className="">
              {collapsed ? (
                <ChevronDown></ChevronDown>
              ) : (
                <ChevronUp></ChevronUp>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t-1 border-gray-200 w-full" />
      <div className="flex-1 flex overflow-hidden justify-center mt-4 max-w-[800px] px-4 w-full">
        {(mode === "edit" || mode === "split") && (
          <div
            className={`${mode === "split" ? "w-1/2" : "w-full"} flex flex-col`}
          >
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onScroll={handleScroll}
              className="flex-1 px-4 w-full font-mono text-sm resize-none outline-none"
              placeholder="Write your markdown here..."
            />
          </div>
        )}
        {(mode === "preview" || mode === "split") && (
          <div
            ref={previewRef}
            className={`${
              mode === "split" ? "w-1/2" : "w-full"
            } overflow-y-auto`}
          >
            <div className="border-l mt-[-20px] border-gray-300 px-4 markdown mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
