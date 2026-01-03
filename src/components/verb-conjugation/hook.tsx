import { useConfigStore } from "@/context/dictionary-context";
import { useState, useEffect, useRef } from "react";

export function useVerbHooks(route: string, name?: string, isEditing?: boolean) {
  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"edit" | "preview" | "split">("preview");
  const [collapsed, setCollapsed] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectOption, setSelectOption] = useState<"notes" | "conjugation">("notes");
  const { selectedWord } = useConfigStore();

  const placeholder = {
    "Indicative": {
      "Simple": {
        "Präsens": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Präteritum": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
      },
      "Compound": {
        "Perfekt": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Plusquamperfekt": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Futur I": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Futur II": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
      },
    },
    "Subjunctive": {
      "Konjunktiv I": {
        "Präsens": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Perfekt": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
      },
      "Konjunktiv II": {
        "Präteritum": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Plusquamperfekt": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
        "Würde-Form": {
          "1s": "",
          "2s": "",
          "3s": "",
          "1p": "",
          "2p": "",
          "3p": "",
        },
      },
    },
    "Imperative": {
      "Imperativ I": {
        "Obligation": {
          "2s": "",
          "2p": "",
          "3p": "",
        }
      }
    }
  };

  const [conjugation, setConjugation] = useState<any>(placeholder);

  const saveConjugation = () => {
    if(JSON.stringify(conjugation) == JSON.stringify(placeholder)) return
    console.log("Saving conjugation:", conjugation);
    window.api.saveConjugation(route, name!, selectedWord?.uuid, conjugation);
  };

  useEffect(() => {
    saveConjugation();
  }, [isEditing]);

  useEffect(() => {
    console.log("Fetching conjugation for", route + "/CONJ-" + name, selectedWord?.uuid);
    window.api
      .fetchConjugation(route, name, selectedWord?.uuid)
      .then((response: any) => {
        if (Object.keys(response).length !== 0) {
          setConjugation(response);
        }
        else setConjugation(placeholder);
      })
      .catch((error: any) => {
        console.error("Error fetching conjugation:", error);
      });
  }, [selectedWord]);

  return {
    markdown,
    setMarkdown,
    mode,
    setMode,
    collapsed,
    setCollapsed,
    editorRef,
    previewRef,
    selectOption,
    setSelectOption,
    conjugation,
    setConjugation,
    saveConjugation,
  };
}