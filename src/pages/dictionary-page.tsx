import Dictionary from "@/components/dict";

export default function DictionaryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get('path') || "";
  const name = urlParams.get('name') || "";

  return <Dictionary route={path} name={name} />;
}
