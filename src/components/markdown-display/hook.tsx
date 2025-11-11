import { useState, useEffect } from "react";

export function useMarkdown(route: string, name?: string) {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    (window.api).fetchMarkdown(route, name).then((response: any) => setMarkdown(response));
  }, []);

  return { markdown, setMarkdown };
}

