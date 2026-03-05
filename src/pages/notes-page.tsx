import Notes from "@/components/notes";
import { useSearchParams } from "react-router-dom";

export default function NotesPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || "";
  const name = searchParams.get('name') || "";

  return <Notes key={`${path}-${name}`} route={path} name={name} />;
}
