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
  X,
} from "lucide-react";
import { TranslationEntry } from "@/types/translation-entry";
import { useMarkdown } from "./hook";
import WordCard from "../word-card";
import VerboConjugation from "../verb-conjugation";
import SearchBar from "../word-link";

export default function MarkdownEditor({
  route,
  name,
  uuid,
  word,
}: {
  route: string;
  name: string;
  uuid?: string;
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
    setSelectOption,
    selectOption,
    isEditing,
    setIsEditing,
    handleWordSelect,
    handleWordDelete,
    linkedWordList
  } = useMarkdown(route, uuid, name, word);

  return (
    <div className="flex overflow-hidden h-[calc(100vh-160px)] items-center flex-col mx-auto mt-4">
      {/* Header */}
      <div className={`px-4 max-w-[800px] ${word.type == "verb" ? "pb-6" : ""}  w-full ${collapsed ? "hidden" : ""}`}>
        <WordCard word={word} />
        {word.type == "verb" && <div className="flex flex-row mt-6 justify-around divide-x w-full">
          <button onClick={() => setSelectOption("notes")}
            className={`border-b w-full cursor-pointer text-sm pb-1 ${selectOption === "notes" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            Notes
          </button>
          <button onClick={() => setSelectOption("conjugation")}
            className={`border-b w-full cursor-pointer text-sm pb-1 ${selectOption === "conjugation" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            Conjugation
          </button>
        </div>}
      </div>
      <div className="flex flex-col border-b items-center w-full">
        {selectOption === "notes" && <div className="flex flex-col justify-between max-w-[800px] px-4 w-full">
          <div className="py-2 mb-2">
            <p className="text-sm font-semibold mb-1 text-foreground">Related Words</p>
            {Object.keys(linkedWordList).length === 0 && (
              <p className="text-xs text-muted-foreground">
                No linked words. Use the search bar below to link words to this note.
              </p>
            )}
            <div className="flex flex-row gap-1 flex-wrap">
              {Object.entries(linkedWordList).map(([id, word]) => (
                <div
                  key={id}
                  className="flex items-center gap-1 bg-card text-card-foreground rounded-lg text-sm py-1 px-2 border border-border"
                >
                  <p>
                    {word}
                  </p>
                  <X
                    className="cursor-pointer"
                    size={14}
                    onClick={() => handleWordDelete(id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <SearchBar
            placeholder="Search for a word"
            buttonLabel="Link word"
            onWordSelect={handleWordSelect}
            showDropdown={true}
            name={name}
          />
          <div className="flex flex-row justify-between mt-4">
              <div className="flex flex-row flex-wrap gap-2 text-sm">
              <button
                onClick={() => setMode("edit")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 border border-border ${mode === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground hover:bg-popover"
                  } `}
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => setMode("split")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 border border-border ${mode === "split"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground hover:bg-popover"
                  } `}
              >
                <Split size={16} />
                Split
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-3 py-1 rounded-full flex items-center gap-2 border border-border ${mode === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground hover:bg-popover"
                  } `}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
            <button
              onClick={saveMarkdown}
              className="px-3 h-fit py-1 rounded-full flex items-center gap-2 border border-border bg-card text-card-foreground hover:bg-popover transition duration-100"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>}
        {selectOption === "conjugation" && <div className="flex flex-col justify-between max-w-[800px] px-4 w-full">
          <div className="flex flex-row flex-wrap justify-between mt-4">
            <div className="flex flex-row gap-2 text-sm">
            </div>
            {!isEditing && <button
              onClick={() => setIsEditing(true)}
              className="px-3 h-fit py-1 rounded-full flex items-center gap-2 border border-border bg-card text-card-foreground hover:bg-popover transition duration-100"
            >
              <Edit3 size={16} />
              Edit
            </button>}
            {isEditing && <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded-full flex items-center gap-2 border border-border bg-primary text-primary-foreground hover:opacity-90 transition duration-100"
            >
              <Save size={16} />
              Save
            </button>}
          </div>
        </div>}
        <button onClick={() => setCollapsed(!collapsed)} className="mt-2 mb-3">
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      <div className="border-gray-300 w-full" />
      {selectOption === "notes" && <div className="flex-1 flex overflow-hidden justify-center mt-4 max-w-[800px] px-4 w-full">
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
            <div className="mt-[-20px] px-1 markdown mx-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
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
      </div>}
      {selectOption === "conjugation" && <VerboConjugation route={route} name={name} isEditing={isEditing} setIsEditing={setIsEditing} />}
    </div>
  );
}
