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
import { useConfigStore } from "@/context/dictionary-context";
import { SimpleEditor } from "../ui/tiptap/tiptap-templates/simple/simple-editor";

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
    collapsed,
    setCollapsed,
    setSelectOption,
    selectOption,
    isEditing,
    setIsEditing,
    handleWordSelect,
    handleWordDelete,
    linkedWordList,
  } = useMarkdown(route, uuid, name, word);
  const { dictionaryMetadata } = useConfigStore();

  return (
    <div className="flex overflow-hidden h-[calc(100vh-80px)] items-center flex-col mx-auto mt-4">
      {/* Header */}
      <div
        className={`px-4 max-w-[800px] ${word.type == dictionaryMetadata?.[name]?.typeWordWithTenses && dictionaryMetadata?.[name]?.useTenses} "pb-6" : ""}  w-full ${collapsed ? "hidden" : ""}`}
      >
        <WordCard name={name} word={word} />
        {word.type == dictionaryMetadata?.[name]?.typeWordWithTenses &&
          dictionaryMetadata?.[name]?.useTenses && (
            <div className="flex flex-row mt-6 justify-around divide-x w-full">
              <button
                onClick={() => setSelectOption("notes")}
                className={`border-b w-full cursor-pointer border-r-0 text-sm pb-1 ${selectOption === "notes" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                Notes
              </button>
              <button
                onClick={() => setSelectOption("conjugation")}
                className={`border-b w-full cursor-pointer text-sm pb-1 ${selectOption === "conjugation" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >
                Conjugation
              </button>
            </div>
          )}
      </div>
      <div className="flex flex-col border-b items-center w-full">
        {selectOption === "notes" && (
          <div className="flex flex-col justify-between max-w-[800px] px-4 w-full">
            <div className="py-2 mb-2">
              <p className="text-sm font-semibold mb-1 text-foreground">
                Related Words
              </p>
              {Object.keys(linkedWordList).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No linked words. Use the search bar below to link words to
                  this note.
                </p>
              )}
              <div className="flex flex-row gap-1 flex-wrap">
                {Object.entries(linkedWordList).map(([id, word]) => (
                  <div
                    key={id}
                    className="flex items-center gap-1 bg-card text-card-foreground rounded-lg text-sm py-1 px-2 border border-border"
                  >
                    <p>{word}</p>
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
          </div>
        )}
        {selectOption === "conjugation" && (
          <div className="flex flex-col justify-between px-4 w-full">
            <div className="flex flex-row flex-wrap justify-between mt-4 max-w-210">
              <div className="flex flex-row gap-2 text-sm"></div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 h-fit py-1 rounded-full flex items-center gap-2 border border-border bg-card text-card-foreground hover:bg-popover transition duration-100"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-full flex items-center gap-2 border border-border bg-primary text-primary-foreground hover:opacity-90 transition duration-100"
                >
                  <Save size={16} />
                  Save
                </button>
              )}
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="mt-2 mb-3">
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>
      <div className="border-gray-300 w-full" />
      {selectOption === "notes" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center p-4">
            <SimpleEditor route={route} name={name} type="words" />
          </div>
        </div>
      )}
      {selectOption === "conjugation" && (
        <VerboConjugation
          route={route}
          name={name}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}
