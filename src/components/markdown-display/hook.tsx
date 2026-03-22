import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState, useEffect, useRef, useCallback } from "react";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export function useMarkdown(
  route: string,
  uuid: string | undefined,
  name: string,
  word: TranslationEntry,
) {

  const [markdown, setMarkdown] = useState<unknown>(null);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const [selectOption, setSelectOption] = useState<"notes" | "conjugation">("notes");
  const [isEditing, setIsEditing] = useState(false);
  const [linkedWordList, setLinkedWordList] = useState<Record<string, string>>({});
  const { selectedWord, dictionaryMetadata } = DictionaryContext();

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

  const expandChat = useCallback(() => {
    const maxWidth = getMaxChatWidth();
    if (maxWidth < CHAT_MIN) {
      setChatCollapsed(false);
      setChatWidth(CHAT_MIN);
      return;
    }
    setChatCollapsed(false);
    setChatWidth(Math.max(CHAT_MIN, Math.min(CHAT_DEFAULT, maxWidth)));
  }, [getMaxChatWidth]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = getMaxChatWidth();
      if (!chatCollapsedRef.current) {
        const clampedMax = Math.max(CHAT_MIN, maxWidth);
        if (chatWidthRef.current > clampedMax) {
          setChatWidth(clampedMax);
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
        const maxWidth = Math.max(CHAT_MIN, getMaxChatWidth());
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

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await window.api.fetchGraph(route, name, uuid);
        const linked =
          isRecord(response) ? (response as Record<string, string>) : {};
        setLinkedWordList(linked);
      } catch (error) {
        console.error("Error fetching graph:", error);
      }
    };

    if (uuid && name && route) {
      fetchGraph();
    } else {
      setLinkedWordList({});
    }
  }, [uuid, name, route]);

  const handleWordSelect = (connection: TranslationEntry) => {
    const connectionUuid = connection.uuid;
    if (!uuid || !connectionUuid) return;
    const text = connection.pair[0].original.word;
    const wordOfOrigin = word.pair[0].original.word || "";
    setLinkedWordList(prev => ({
      ...prev,
      [connectionUuid]: text,
    }));
    window.api.saveGraph(route, name,
      {
        uuid,
        word: wordOfOrigin,
      },
      {
        uuid: connectionUuid,
        word: text,
      }
    );
  };

  const handleWordDelete = (id: string) => {
    if (!uuid) return;
    setLinkedWordList(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    window.api.deleteGraphEntry(route, name, 
      { uuid, word: "" }, 
      { uuid: id, word: linkedWordList[id] ?? "" }
    );
  };

  useEffect(() => {
    if (!uuid) {
      setMarkdown(null);
      return;
    }
    window.api.fetchMarkdown(route, name, uuid).then((response) => {
      setMarkdown(response);
    });
  }, [route, name, uuid]);

  useEffect(() => {
    setCollapsed(false);
  }, [selectedWord, uuid]);

  useEffect(() => {
    if (
      word.type !== dictionaryMetadata?.[name]?.typeWordWithTenses ||
      !dictionaryMetadata?.[name]?.useTenses
    ) {
      setSelectOption("notes");
    }
  }, [word, dictionaryMetadata, name]);

  return {
    markdown,
    setMarkdown,
    mode,
    setMode,
    collapsed,
    setCollapsed,
    editorRef,
    previewRef,
    selectOption,
    setSelectOption,
    isEditing,
    setIsEditing,
    handleWordSelect,
    handleWordDelete,
    linkedWordList,
    dictionaryMetadata,
    containerRef,
    chatCollapsed,
    chatWidth,
    expandChat,
    handleResizeChat,
  };
}
