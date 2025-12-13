import Dictionary from "@/components/verb-dict";
import { useSearchParams } from "react-router-dom";

export default function DictionaryPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  return <Dictionary key={`${path}-${name}`} route={path} name={name} />;
}
