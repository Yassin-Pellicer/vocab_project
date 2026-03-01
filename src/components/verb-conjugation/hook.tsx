import { useConfigStore } from "@/context/dictionary-context";
import { useState, useEffect } from "react";

export function useVerbHooks(route: string, name?: string, isEditing?: boolean) {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedWord } = useConfigStore();
  const [conjugationLoaded, setConjugationLoaded] = useState(false);
  const { dictionaryMetadata } = useConfigStore();

  const [conjugation, setConjugation] = useState<any>(dictionaryMetadata?.[name!]?.tenses || {});

  const saveConjugation = () => {
    console.log("Saving conjugation:", conjugation);
    window.api.saveConjugation(route, name!, selectedWord?.uuid, conjugation);
  };

  useEffect(() => {
    if (conjugationLoaded) {
      saveConjugation();
    }
  }, [isEditing]);

  useEffect(() => {
    console.log("Fetching conjugation for", route + "/CONJ-" + name, selectedWord?.uuid);
    setConjugationLoaded(false);
    window.api
      .fetchConjugation(route, name, selectedWord?.uuid)
      .then((response: any) => {
        if (Object.keys(response).length !== 0) {
          setConjugation(response);
        }
        else setConjugation(conjugation);
        setConjugationLoaded(true);
      })
      .catch((error: any) => {
        console.error("Error fetching conjugation:", error);
        setConjugationLoaded(true);
      });
  }, [selectedWord]);

  return {
    collapsed,
    setCollapsed,
    conjugation,
    setConjugation,
    saveConjugation,
  };
}