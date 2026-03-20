import "highlight.js/styles/github.css";
import {
  Edit3,
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
import { Chat } from "../chat/index.tsx";
import { useState, useCallback, useEffect, useRef } from "react";

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

  const CHAT_DEFAULT = 320;
  const CHAT_MIN = 260;
  const MIN_MAIN_WIDTH = 360;
  const containerRef = useRef<HTMLDivElement>(null);

  const [chatCollapsed, setChatCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("markdown-chat-sidebar");
      if (!raw) return false;
      return Boolean(JSON.parse(raw)?.collapsed);
    } catch {
      return false;
    }
  });

  const [chatWidth, setChatWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("markdown-chat-sidebar");
      if (!raw) return CHAT_DEFAULT;
      const parsed = Number(JSON.parse(raw)?.width);
      return Number.isFinite(parsed) ? parsed : CHAT_DEFAULT;
    } catch {
      return CHAT_DEFAULT;
    }
  });

  const chatWidthRef = useRef(chatWidth);
  const chatCollapsedRef = useRef(chatCollapsed);
  useEffect(() => { chatWidthRef.current = chatWidth; }, [chatWidth]);
  useEffect(() => { chatCollapsedRef.current = chatCollapsed; }, [chatCollapsed]);

  const getContainerWidth = useCallback(() => {
    return (
      containerRef.current?.getBoundingClientRect().width ?? window.innerWidth
    );
  }, []);

  const getMaxChatWidth = useCallback(() => {
    const containerWidth = getContainerWidth();
    return Math.max(0, Math.floor(containerWidth - MIN_MAIN_WIDTH));
  }, [getContainerWidth]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = getMaxChatWidth();
      if (!chatCollapsedRef.current) {
        if (maxWidth < CHAT_MIN) {
          setChatCollapsed(true);
          return;
        }
        if (chatWidthRef.current > maxWidth) {
          setChatWidth(maxWidth);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getMaxChatWidth]);

  const handleResizeChat = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = chatCollapsed ? 0 : chatWidth;

      const onMove = (ev: PointerEvent) => {
        const rawNext = startWidth + (startX - ev.clientX);
        const maxWidth = getMaxChatWidth();
        if (maxWidth < CHAT_MIN) {
          setChatCollapsed(true);
          localStorage.setItem(
            "markdown-chat-sidebar",
            JSON.stringify({ collapsed: true, width: chatWidth }),
          );
          return;
        }
        if (rawNext < CHAT_MIN) {
          setChatCollapsed(true);
          localStorage.setItem(
            "markdown-chat-sidebar",
            JSON.stringify({ collapsed: true, width: chatWidth }),
          );
          return;
        }
        const next = Math.min(maxWidth, Math.max(CHAT_MIN, rawNext));
        setChatCollapsed(false);
        setChatWidth(next);
        localStorage.setItem(
          "markdown-chat-sidebar",
          JSON.stringify({ collapsed: false, width: next }),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [chatWidth, chatCollapsed, getMaxChatWidth],
  );

  return (
    <div ref={containerRef} className="flex flex-row overflow-hidden h-full w-full min-w-0">
      <div className="flex-1 min-w-0 flex flex-col items-center overflow-hidden">
        <div
          className={`px-4 max-w-200 ${
            word.type == dictionaryMetadata?.[name]?.typeWordWithTenses &&
            dictionaryMetadata?.[name]?.useTenses
              ? "pb-6"
              : ""
          } w-full mt-4 ${collapsed ? "hidden" : ""}`}
        >
          <WordCard name={name} word={word} />
          {word.type == dictionaryMetadata?.[name]?.typeWordWithTenses &&
            dictionaryMetadata?.[name]?.useTenses && (
              <div className="flex flex-row mt-6 justify-around divide-x w-full">
                <button
                  onClick={() => setSelectOption("notes")}
                  className={`border-b w-full cursor-pointer border-r-0 text-sm pb-1 ${
                    selectOption === "notes"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setSelectOption("conjugation")}
                  className={`border-b w-full cursor-pointer text-sm pb-1 ${
                    selectOption === "conjugation"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Conjugation
                </button>
              </div>
            )}
        </div>

        <div className="flex flex-col border-b items-center w-full">
          {selectOption === "notes" && (
            <div className="flex flex-col justify-between max-w-200 px-4 w-full">
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
            <div className="flex flex-col justify-between max-w-200 w-full mt-4">
              <div className="flex flex-row w-fit max-w-200 px-4">
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
          <div className="flex-1 overflow-y-auto w-full">
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

      {/* Chat panel — Notes-style drag-resize */}
      {chatCollapsed ? (
        <div className="shrink-0 relative" style={{ width: 8 }}>
          <div
            role="separator"
            aria-orientation="vertical"
            title="Drag to expand chat"
            onPointerDown={handleResizeChat}
            className="absolute left-0 top-0 h-full w-2 cursor-col-resize bg-muted/20 hover:bg-muted/40"
          />
        </div>
      ) : (
        <div
          className="shrink-0 flex flex-col border-l relative"
          style={{ width: chatWidth }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize chat"
            onPointerDown={handleResizeChat}
            className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-muted/20 z-10"
          />
          <div className="flex-1 shrink-0 p-4 overflow-y-auto">
            <Chat context={{type: "word", content: word}}/>
          </div>
        </div>
      )}
    </div>
  );
}
