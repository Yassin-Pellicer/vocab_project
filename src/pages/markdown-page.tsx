"use client";

import Markdown from "@/components/markdown-display";
import { useConfigStore } from "@/context/dictionary-context";

export default function MarkdownPage({ _uuid }: { _uuid?: string }) {

  const urlParams = new URLSearchParams(window.location.search);

  let path = urlParams.get("path") || "";
  const name = urlParams.get("name") || "";

  path = path.replace(/\\/g, "/");

  path = path.replace(/\/+/g, "/");

  let word = useConfigStore((state) => state.selectedWord);
  let dictionaries = useConfigStore((state) => state.dictionaries);
  if (!word) {
    if (!_uuid) {
      return <p className="text-center text-gray-500 mt-4">No word selected.</p>;
    }
    word = dictionaries[name].filter((_word) =>
      _word.uuid === _uuid)[0];
  }

  return (
    <Markdown
      route={path}
      name={name}
      uuid={word.uuid!}
      word={word}
    />
  );
}
