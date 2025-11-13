import { useState, useEffect } from "react";

export function useMarkdown(route: string, name?: string) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");

  const saveMarkdown = () => {
    (window.api).saveMarkdown(route, name, markdown);
  }

  useEffect(() => {
    console.log(route);
    (window.api).fetchMarkdown(route, name).then((response: any) => setMarkdown(response));
  }, []);

  return { markdown, setMarkdown, mode, setMode, saveMarkdown };
}

