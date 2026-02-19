import { useConfigStore } from "@/context/dictionary-context";

export default function useConfig() {
  const { dictionaryMetadata } = useConfigStore();
  return { dictionaryMetadata };
}
