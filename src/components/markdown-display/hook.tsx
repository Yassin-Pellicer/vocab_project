import { useConfigStore } from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState, useEffect, useRef } from "react";

export function useMarkdown(route: string, uuid?: string, name?: string, word?: TranslationEntry) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const [selectOption, setSelectOption] = useState<"notes" | "conjugation">("notes");
  const [isEditing, setIsEditing] = useState(false);
  const [linkedWordList, setLinkedWordList] = useState<Record<string, string>>({});
  const { selectedWord } = useConfigStore();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("linkedWordList updated:", linkedWordList);
  }, [linkedWordList]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await window.api.fetchGraph(route, name, uuid);
        console.log("Fetched graph response:", response);
        setLinkedWordList(response);
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

  const saveMarkdown = () => {
    console.log("Saving markdown for", name, uuid, markdown);
    window.api.saveMarkdown(route, name, uuid, markdown);
  };

  const handleWordSelect = (connection: TranslationEntry) => {
    const text = connection.pair[0].original.word;
    const wordOfOrigin = word?.pair[0].original.word || "";
    console.log(wordOfOrigin, "is connecting to", text);
    setLinkedWordList(prev => ({
      ...prev,
      [connection.uuid as string]: text,
    }));
    window.api.saveGraph(route, name,
      {
        uuid: uuid,
        word: wordOfOrigin,
      },
      {
        uuid: connection.uuid,
        word: text,
      }
    );
    console.log("Saved graph connection ", uuid, "and", wordOfOrigin);
    console.log("Saved graph connection ", connection.uuid, "and", text);
  };

  const handleWordDelete = (id: string) => {
    setLinkedWordList(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    window.api.deleteGraphEntry(route, name, { uuid }, { uuid: id, word: linkedWordList[id] });
  };

  const handleScroll = () => {
    if (!editorRef.current || !previewRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    const editorMax = editor.scrollHeight - editor.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    const percent = editor.scrollTop / editorMax;
    preview.scrollTop = percent * previewMax;
  };

  useEffect(() => {
    console.log("Fetching markdown for", route, uuid);
    window.api
      .fetchMarkdown(route, name, uuid)
      .then((response: string) => setMarkdown(response));
  }, [route, name, uuid]);

  useEffect(() => {
    setCollapsed(false);
  }, [selectedWord]);

  useEffect(() => {
    if (word?.type !== "verb") {
      setSelectOption("notes");
    }
  }, [word]);

  return {
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
    selectOption,
    setSelectOption,
    isEditing,
    setIsEditing,
    handleWordSelect,
    handleWordDelete,
    linkedWordList,
  };
}