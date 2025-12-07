"use client";

import Markdown from "@/components/markdown-display";
import useConfigStore from "@/context/dictionary-context";

export default function MarkdownPage() {
  const word = useConfigStore((state) => state.selectedWord);
  if (!word)
    return <p className="text-center text-gray-500 mt-4">No word selected.</p>;

  const urlParams = new URLSearchParams(window.location.search);

  let path = urlParams.get("path") || "";
  const name = urlParams.get("name") || "";

  // 🔥 Normalize Windows paths into URL-safe forward slashes
  path = path.replace(/\\/g, "/");

  // 🔥 Avoid double slashes (//) except the leading one
  path = path.replace(/\/+/g, "/");

  return (
    <Markdown
      route={`${path}/MD-${name}`}
      name={word.uuid!}
      word={word}
    />
  );
}
