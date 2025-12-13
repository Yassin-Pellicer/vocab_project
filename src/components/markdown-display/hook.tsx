import useConfigStore from "@/context/dictionary-context";
import { useState, useEffect, useRef } from "react";

export function useMarkdown(route: string, name?: string) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { selectedWord } = useConfigStore();

  const saveMarkdown = () => {
    window.api.saveMarkdown(route, name, markdown);
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
      .fetchMarkdown(route, name)
      .then((response: string) => setMarkdown(response));
  }, [selectedWord, route, name]);

  useEffect(() => { 
    setCollapsed(false);
  }, [selectedWord])

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
  };
}