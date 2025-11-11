import Markdown from "@/components/markdown-display";
import useConfigStore from "@/context/dictionary-context";

export default function MarkdownPage() {
  const word = useConfigStore((state) => state.selectedWord);

  if (!word) return <p className="text-center text-gray-500 mt-4">No word selected.</p>;

  return <Markdown route="C:\\Users\\yassi\\Desktop\\" name="palabra" word={word} />;
}