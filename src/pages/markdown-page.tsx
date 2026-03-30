"use client";

import Markdown from "@/components/markdown-display";
import { DictionaryContext } from "@/context/dictionary-context";
import { FloatingAssistantChat } from "@/components/chat/floating-assistant-chat";

export default function MarkdownPage({ _uuid }: { _uuid?: string }) {
  const urlParams = new URLSearchParams(window.location.search);

  let path = urlParams.get("path") || "";
  const name = urlParams.get("name") || "";
  const uuidFromQuery = urlParams.get("uuid") || undefined;

  path = path.replace(/\\/g, "/");
  path = path.replace(/\/+/g, "/");

  const selectedWord = DictionaryContext((state) => state.selectedWordByDict[name] ?? null);
  const dictionaries = DictionaryContext((state) => state.dictionaries);
  const wordFromQuery = uuidFromQuery
    ? dictionaries[name]?.find((w) => w.uuid === uuidFromQuery)
    : undefined;

  const word =
    wordFromQuery ??
    selectedWord ??
    (_uuid ? dictionaries[name]?.find((w) => w.uuid === _uuid) : undefined);

  return (
    <div className="relative flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {word?.uuid ? (
          <Markdown route={path} name={name} uuid={word.uuid} word={word} />
        ) : (
          <p className="p-4 text-center text-muted-foreground">No word selected.</p>
        )}
      </div>
      <FloatingAssistantChat
        route={path}
        name={name}
        context={word ? { type: "word", content: word } : undefined}
        layoutStorageKey={`floating-assistant:dict:${name}`}
      />
    </div>
  );
}
