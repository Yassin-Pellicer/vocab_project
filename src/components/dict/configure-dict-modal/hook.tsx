import { DictionaryContext } from "@/context/dictionary-context";
import { useState } from "react";

export default function useChangeRouteModalHooks(dictId: string) {
  
  const {
    dictionaryMetadata,
    setDictionaryTypeWords,
    setDictionaryGenders,
    setDictionaryNumbers,
    setDictionaryArticles,
    setDictionaryUseTenses,
    setDictionaryUseArticles,
    setTypeWordWithPrecededArticle,
  } = DictionaryContext();

  const [inputTypeWord, setInputTypeWord] = useState("");
  const [inputGender, setInputGender] = useState("");
  const [inputNumber, setInputNumber] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [genderNumberInput, setGenderNumberInput] = useState("");
  const [
    selectTypeWordWithPrecededArticle,
    setSelectTypeWordWithPrecededArticle,
  ] = useState(dictionaryMetadata?.[dictId]?.typeWordWithPrecededArticle || "");

  const [selectedWordType, setSelectedWordType] = useState(
    dictionaryMetadata?.[dictId]?.typeWords?.[0] || "",
  );

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

    selectTypeWordWithPrecededArticle,
    setPrecededArticleTypeWord,
  };
}
