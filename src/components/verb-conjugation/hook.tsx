import { useConfigStore } from "@/context/dictionary-context";
import { useCallback, useEffect, useMemo, useState } from "react";

type TenseConjugations = Record<string, string>;
type TenseGroup = Record<string, TenseConjugations>;
type MoodGroup = Record<string, TenseGroup>;
type ConjugationTemplate = Record<string, MoodGroup>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const getLeaf = (
  obj: unknown,
  mood: string,
  group: string,
  tense: string,
  person: string,
): string | undefined => {
  if (!isRecord(obj)) return undefined;
  const moodObj = obj[mood];
  if (!isRecord(moodObj)) return undefined;
  const groupObj = moodObj[group];
  if (!isRecord(groupObj)) return undefined;
  const tenseObj = groupObj[tense];
  if (!isRecord(tenseObj)) return undefined;
  const value = tenseObj[person];
  return typeof value === "string" ? value : undefined;
};

const mergeConjugations = (
  template: ConjugationTemplate,
  existing: unknown,
): ConjugationTemplate => {
  const next = structuredClone(template);

  for (const mood of Object.keys(next)) {
    for (const group of Object.keys(next[mood])) {
      for (const tense of Object.keys(next[mood][group])) {
        for (const person of Object.keys(next[mood][group][tense])) {
          const v = getLeaf(existing, mood, group, tense, person);
          if (typeof v === "string") {
            next[mood][group][tense][person] = v;
          }
        }
      }
    }
  }

  return next;
};

export function useVerbHooks(
  route: string,
  name?: string,
  isEditing?: boolean,
) {
  const [collapsed, setCollapsed] = useState(false);
  const selectedWord = useConfigStore((s) => s.selectedWord);
  const [conjugationLoaded, setConjugationLoaded] = useState(false);
  const dictionaryMetadata = useConfigStore((s) => s.dictionaryMetadata);

  const template = useMemo(
    () =>
      (dictionaryMetadata?.[name ?? ""]?.tenses ?? {}) as unknown as ConjugationTemplate,
    [dictionaryMetadata, name],
  );

  const cloneTemplate = useCallback(
    () => structuredClone(template),
    [template],
  );

  const [conjugation, setConjugation] = useState<ConjugationTemplate>(() =>
    cloneTemplate(),
  );

  const selectedWordUuid = selectedWord?.uuid;

  const saveConjugation = useCallback(() => {
    if (!route || !name || !selectedWordUuid) return;
    void window.api.saveConjugation(route, name, selectedWordUuid, conjugation);
  }, [conjugation, name, route, selectedWordUuid]);

  useEffect(() => {
    if (!isEditing && conjugationLoaded) {
      saveConjugation();
    }
  }, [conjugationLoaded, isEditing, saveConjugation]);

  useEffect(() => {
    if (!route || !name || !selectedWordUuid) {
      setConjugation(cloneTemplate());
      setConjugationLoaded(true);
      return;
    }

    setConjugationLoaded(false);
    window.api
      .fetchConjugation(route, name, selectedWordUuid)
      .then((response) => {
        const merged = mergeConjugations(cloneTemplate(), response);
        setConjugation(merged);
        setConjugationLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching conjugation:", error);
        setConjugation(cloneTemplate());
        setConjugationLoaded(true);
      });
  }, [cloneTemplate, name, route, selectedWordUuid]);

  return {
    collapsed,
    setCollapsed,
    conjugation,
    setConjugation,
    saveConjugation,
  };
}
