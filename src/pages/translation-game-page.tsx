import TranslationGame from "@/components/translation-game";
import { useSearchParams } from "react-router-dom";

export default function TranslationGamePage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  return <TranslationGame key={`${path}-${name}`} route={path} name={name} />;
}
