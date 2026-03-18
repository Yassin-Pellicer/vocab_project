"use client";

import Markdown from "@/components/markdown-display";
import { useConfigStore } from "@/context/dictionary-context";

export default function MarkdownPage({ _uuid }: { _uuid?: string }) {
  const urlParams = new URLSearchParams(window.location.search);

  let path = urlParams.get("path") || "";
  const name = urlParams.get("name") || "";

  path = path.replace(/\\/g, "/");
  path = path.replace(/\/+/g, "/");

  const selectedWord = useConfigStore((state) => state.selectedWord);
  const dictionaries = useConfigStore((state) => state.dictionaries);

  const word =
    selectedWord ??
    (_uuid ? dictionaries[name]?.find((w) => w.uuid === _uuid) : undefined);

  if (!word?.uuid) {
    return <p className="text-center text-gray-500 mt-4">No word selected.</p>;
  }

  return (
    <div className="flex flex-row-reverse overflow-hidden h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto">
        {selectedWord ? (
          <Markdown
            route={path}
            name={name}
            uuid={selectedWord.uuid}
            word={selectedWord}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a word to view details
          </div>
        )}
      </div>
    </div>
  );
}
