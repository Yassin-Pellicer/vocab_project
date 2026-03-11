import Dictionary from "@/components/dict";
import { useSearchParams } from "react-router-dom";

export default function DictionaryPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  if (!path || !name) return null;

  return <Dictionary key={`${path}-${name}`} route={path} name={name} />;
}