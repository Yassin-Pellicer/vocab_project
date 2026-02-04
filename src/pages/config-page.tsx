import Config from "@/components/config";
import { useSearchParams } from "react-router-dom";

export default function DictionaryPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  return <Config key={`${path}-${name}`} route={path} name={name} />;
}
