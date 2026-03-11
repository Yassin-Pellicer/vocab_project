import TranslationGame from "@/components/translation-game";
import { useSearchParams } from "react-router-dom";

export default function NotesPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  if (!path || !name) return null;

  return <TranslationGame key={`${path}-${name}`} route={path} name={name} />;
}