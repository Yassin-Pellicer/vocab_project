import useConfigStore from "@/context/dictionary-context";
import { TranslationEntry } from "@/types/translation-entry";
import { useState, useEffect, useRef } from "react";

export function useMarkdown(route: string, uuid: string, name?: string, word?: TranslationEntry) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectOption, setSelectOption] = useState<"notes" | "conjugation">("notes");
  const [isEditing, setIsEditing] = useState(false);

  const { selectedWord } = useConfigStore();

  const saveMarkdown = () => {
    console.log("Saving markdown for", `${route.replace(/\\/g, "/")}/MD-${uuid}/${name}`, );
    window.api.saveMarkdown(`${route.replace(/\\/g, "/")}/MD-${uuid}`, name, markdown);
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
    console.log("Fetching markdown for", route, name);
    window.api
      .fetchMarkdown(`${route.replace(/\\/g, "/")}/MD-${uuid}`, name)
      .then((response: string) => setMarkdown(response));
  }, [selectedWord, route, name]);

  useEffect(() => { 
    setCollapsed(false);
  }, [selectedWord])

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
  };
}