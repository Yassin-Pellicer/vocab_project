import { DictionaryContext } from "@/context/dictionary-context";
import { Dictionary } from "@/types/config";
import { useState } from "react";
import { notify } from "@/services/notify";
import { notifyError } from "@/services/notify";
import { supabase } from "@/supabase/supabase-client";

export default function useChangeRouteModalHooks(dictId: string, dictName: string) {
  
  const {
    dictionaryMetadata,
    setDictionaryMetadata,
    setDictionaryTypeWords,
    setDictionaryGenders,
    setDictionaryNumbers,
    setDictionaryArticles,
    setDictionaryUseTenses,
    setDictionaryUseArticles,
    setTypeWordWithPrecededArticle,
    editConfig,
  } = DictionaryContext();

  const [inputTypeWord, setInputTypeWord] = useState("");
  const [inputGender, setInputGender] = useState("");
  const [inputNumber, setInputNumber] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [genderNumberInput, setGenderNumberInput] = useState("");
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);
  const [
    selectTypeWordWithPrecededArticle,
    setSelectTypeWordWithPrecededArticle,
  ] = useState(dictionaryMetadata?.[dictId]?.typeWordWithPrecededArticle || "");

  const [selectedWordType, setSelectedWordType] = useState(
    dictionaryMetadata?.[dictId]?.typeWords?.[0] || "",
  );

  const handleAutomaticConfiguration = async () => {
    setIsGeneratingConfig(true);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new Error("You must be signed in with a valid session to generate configuration.");
      }
      console.log("Requesting automatic configuration for language:", dictName);
      const result: Dictionary = await window.api.chatConfig(dictName, accessToken);
      console.log("Received config from chat API:", result);
      setDictionaryMetadata({
        ...dictionaryMetadata,
        [dictId]: {
          ...dictionaryMetadata?.[dictId],
          ...result,
        },
      });
      notify("configGenerated", { language: dictName });
    } catch (error) {
      console.error("Error generating configuration:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      notifyError("Configuration generation failed", errorMessage);
    } finally {
      setIsGeneratingConfig(false);
    }
  };

  const addTypeWord = () => {
    const trimmed = inputTypeWord.trim();
    if (!trimmed) return;

    setDictionaryTypeWords(dictId, [
      ...(dictionaryMetadata?.[dictId]?.typeWords || []),
      trimmed,
    ]);

    setInputTypeWord("");
  };

  const removeTypeWord = (word: string) => {
    setDictionaryTypeWords(
      dictId,
      (dictionaryMetadata?.[dictId]?.typeWords || []).filter((w) => w !== word),
    );
  };

  const addGender = () => {
    const trimmed = inputGender.trim();
    if (!trimmed) return;

    setDictionaryGenders(dictId, [
      ...(dictionaryMetadata?.[dictId]?.genders || []),
      trimmed,
    ]);

    setInputGender("");
  };

  const removeGender = (gender: string) => {
    setDictionaryGenders(
      dictId,
      (dictionaryMetadata?.[dictId]?.genders || []).filter((g) => g !== gender),
    );
  };

  const addNumber = () => {
    const trimmed = inputNumber.trim();
    if (!trimmed) return;

    setDictionaryNumbers(dictId, [
      ...(dictionaryMetadata?.[dictId]?.numbers || []),
      trimmed,
    ]);

    setInputNumber("");
  };

  const removeNumber = (number: string) => {
    setDictionaryNumbers(
      dictId,
      (dictionaryMetadata?.[dictId]?.numbers || []).filter((n) => n !== number),
    );
  };

  const handleFormAdd = () => {
    const trimmed = genderNumberInput.trim();
    if (!trimmed || !selectedForm) return;

    if (selectedForm == "Gender") {
      setDictionaryGenders(dictId, [
        ...(dictionaryMetadata?.[dictId]?.genders || []),
        trimmed,
      ]);
    } else if (selectedForm == "Number") {
      setDictionaryNumbers(dictId, [
        ...(dictionaryMetadata?.[dictId]?.numbers || []),
        trimmed,
      ]);
    }
    setGenderNumberInput("");
  };

  const setArticleValue = (gender: string, number: string, value: string) => {
    const currentArticles = dictionaryMetadata?.[dictId]?.articles || {};
    setDictionaryArticles(dictId, {
      ...currentArticles,
      [gender]: {
        ...(currentArticles[gender] || {}),
        [number]: value,
      },
    });
  };

  const setUseTenses = (checked: boolean) => {
    setDictionaryUseTenses(dictId, checked);
  };

  const setUseArticles = (checked: boolean) => {
    setDictionaryUseArticles(dictId, checked);
  };

  const setPrecededArticleTypeWord = (typeWord: string) => {
    setSelectTypeWordWithPrecededArticle(typeWord);
    setTypeWordWithPrecededArticle(dictId, typeWord);
  }

  const handleSaveConfiguration = async () => {
    await editConfig();
    notify("configSaved", { scope: "dictionary" });
  };

  return {
    dictionaryMetadata,

    inputTypeWord,
    setInputTypeWord,
    selectedWordType,
    setSelectedWordType,
    addTypeWord,
    removeTypeWord,

    selectedForm,
    setSelectedForm,
    genderNumberInput,
    setGenderNumberInput,

    inputGender,
    setInputGender,
    addGender,
    removeGender,
    handleFormAdd,

    inputNumber,
    setInputNumber,
    addNumber,
    removeNumber,

    setArticleValue,
    setUseTenses,
    setUseArticles,

    handleAutomaticConfiguration,
    isGeneratingConfig,

    selectTypeWordWithPrecededArticle,
    setPrecededArticleTypeWord,
    handleSaveConfiguration,
  };
}
