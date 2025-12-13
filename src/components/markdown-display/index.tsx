import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from 'remark-breaks';
import "highlight.js/styles/github.css";
import {
  Eye,
  Edit3,
  Split,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";
import { useMarkdown } from "./hook";
import WordCard from "../word-card";

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
      <div className={`px-4 max-w-[800px] w-full ${collapsed ? "hidden" : ""}`}>
        <WordCard word={word} />
      </div>
      <div className="flex flex-col border-b pb-4 shadow-xs items-center w-full">
        <div className="flex flex-col justify-between max-w-[800px] px-4 w-full">
          <div className="flex flex-row justify-between mt-4">
            <div className="flex flex-row gap-2 text-sm">
              <button
                onClick={() => setMode("edit")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${mode === "edit"
                  ? "!bg-black text-white"
                  : "transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
                  } `}
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => setMode("split")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${mode === "split"
                  ? "!bg-black text-white"
                  : "transition duration-100 hover:!bg-gray-200 hover:cursor-pointer"
                  } `}
              >
                <Split size={16} />
                Split
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 outline outline-gray-300 ${mode === "preview"
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
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="">
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="border-gray-300 w-full" />
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
            className={`${mode === "split" ? "w-1/2" : "w-full"
              } overflow-y-auto`}
          >
            <div className="mt-[-20px] px-4 markdown mx-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  // Ensure proper table styling
                  table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 my-4" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
