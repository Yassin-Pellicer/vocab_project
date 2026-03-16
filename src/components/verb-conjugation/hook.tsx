import { useConfigStore } from "@/context/dictionary-context";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";

type TenseConjugations = Record<string, string>;
type TenseGroup = Record<string, TenseConjugations>;
type MoodGroup = Record<string, TenseGroup>;
type ConjugationTemplate = Record<string, MoodGroup>;

// Helper: safe merge
const getLeaf = (
  obj: unknown,
  mood: string,
  group: string,
  tense: string,
  person: string,
): string | undefined => {
  if (typeof obj !== "object" || obj === null) return undefined;
  const moodObj = (obj as any)[mood];
  if (typeof moodObj !== "object" || moodObj === null) return undefined;
  const groupObj = moodObj[group];
  if (typeof groupObj !== "object" || groupObj === null) return undefined;
  const tenseObj = groupObj[tense];
  if (typeof tenseObj !== "object" || tenseObj === null) return undefined;
  const value = tenseObj[person];
  return typeof value === "string" ? value : undefined;
};

const mergeConjugations = (
  template: ConjugationTemplate,
  existing: unknown,
): ConjugationTemplate => {
  const next = structuredClone(template);
  if (!existing) return next;

  for (const mood of Object.keys(next)) {
    for (const group of Object.keys(next[mood])) {
      for (const tense of Object.keys(next[mood][group])) {
        for (const person of Object.keys(next[mood][group][tense])) {
          const value = getLeaf(existing, mood, group, tense, person);
          if (value) next[mood][group][tense][person] = value;
        }
      }
    }
  }

  return next;
};
export function useVerbHooks(route: string, name?: string, isEditing?: boolean) {
  const selectedWord = useConfigStore((s) => s.selectedWord);
  const dictionaryMetadata = useConfigStore((s) => s.dictionaryMetadata);

  const template = useMemo(
    () => (dictionaryMetadata?.[name ?? ""]?.tenses ?? {}) as unknown as ConjugationTemplate,
    [dictionaryMetadata, name],
  );
  const createTemplate = useCallback(() => structuredClone(template), [template]);

  const [conjugation, setConjugation] = useState<ConjugationTemplate>(createTemplate);
  const [collapsed, setCollapsed] = useState(false);
  const selectedWordUuid = selectedWord?.uuid;

  const saveConjugation = useCallback(() => {
    if (!route || !name || !selectedWordUuid) return;
    void window.api.saveConjugation(route, name, selectedWordUuid, conjugation);
  }, [route, name, selectedWordUuid, conjugation]);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!route || !name || !selectedWordUuid) {
      setConjugation(createTemplate());
      hasFetchedRef.current = false;
      return;
    }

    hasFetchedRef.current = false;
    setConjugation(createTemplate());

    window.api
      .fetchConjugation(route, name, selectedWordUuid)
      .then((response) => {
        setConjugation(mergeConjugations(createTemplate(), response));
        hasFetchedRef.current = true;
      })
      .catch((err) => {
        console.error("Error fetching conjugation:", err);
        setConjugation(createTemplate());
        hasFetchedRef.current = true;
      });
  }, [route, name, selectedWordUuid, createTemplate]);

  useEffect(() => {
    if (!isEditing && hasFetchedRef.current) {
      if (conjugation && Object.keys(conjugation).length > 0) {
        saveConjugation();
      }
    }
  }, [isEditing, saveConjugation, conjugation]);

  return { collapsed, setCollapsed, conjugation, setConjugation, saveConjugation };
}