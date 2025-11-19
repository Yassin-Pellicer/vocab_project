import { useState, useEffect, useRef } from "react";

export function useMarkdown(route: string, name?: string) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const saveMarkdown = () => {
    window.api.saveMarkdown(route, name, markdown);
  };

  const handleScroll = () => {
    if (!editorRef.current || !previewRef.current) return;
    
    const editor = editorRef.current;
    const preview = previewRef.current;

    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  useEffect(() => {
    console.log(route);
    window.api
      .fetchMarkdown(route, name)
      .then((response: string) => setMarkdown(response));
  }, []);

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
