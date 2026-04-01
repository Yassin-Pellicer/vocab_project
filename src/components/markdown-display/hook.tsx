import { DictionaryContext } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState, useEffect, useRef } from "react";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export function useMarkdown(
  route: string,
  uuid: string | undefined,
  name: string,
  word: TranslationEntry,
  reloadToken = 0,
) {
  const [markdown, setMarkdown] = useState<unknown>(null);
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const [selectOption, setSelectOption] = useState<"notes" | "conjugation">("notes");
  const [isEditing, setIsEditing] = useState(false);
  const [linkedWordList, setLinkedWordList] = useState<Record<string, string>>({});
  const {
    selectedWordByDict,
    dictionaryMetadata,
    dictionaries,
    setSelectedWord,
  } = DictionaryContext();
  const selectedWord = selectedWordByDict[name] ?? null;

  const containerRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await window.api.fetchGraph(route, name, uuid);
        const linked = isRecord(response) ? (response as Record<string, string>) : {};
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
  }, [uuid, name, route, reloadToken]);

  const handleWordSelect = (connection: TranslationEntry) => {
    const connectionUuid = connection.uuid;
    if (!uuid || !connectionUuid || connectionUuid === uuid) return;
    const text = connection.pair[0].original.word;
    setLinkedWordList((prev) => {
      if (prev[connectionUuid]) {
        return prev;
      }
      return {
        ...prev,
        [connectionUuid]: text,
      };
    });
    void window.api.saveGraph(
      route,
      name,
      {
        uuid,
      },
      {
        uuid: connectionUuid,
      }
    );
  };

  const handleWordDelete = (id: string) => {
    if (!uuid) return;
    setLinkedWordList((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    void window.api.deleteGraphEntry(
      route,
      name,
      { uuid },
      { uuid: id }
    );
  };

  const handleLinkedWordClick = (id: string) => {
    if (!id || id === uuid) return;
    const entry = dictionaries[name]?.find((item) => item.uuid === id);
    if (!entry) return;
    setSelectedWord(name, entry);
  };

  const clearSelectedWord = () => {
    setSelectedWord(name, null);
  };

  useEffect(() => {
    if (!uuid) {
      setMarkdown(null);
      return;
    }
    window.api.fetchMarkdown(route, name, uuid).then((response) => {
      setMarkdown(response);
    });
  }, [route, name, uuid, reloadToken]);

  useEffect(() => {
    setCollapsed(false);
  }, [selectedWord, uuid, reloadToken]);

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
    handleLinkedWordClick,
    clearSelectedWord,
    linkedWordList,
    dictionaryMetadata,
    containerRef,
  };
}
