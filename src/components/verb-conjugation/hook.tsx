import { useConfigStore } from "@/context/dictionary-context";
import { useState, useEffect } from "react";
import { isEqual } from "lodash-es";

export function useVerbHooks(
  route: string,
  name?: string,
  isEditing?: boolean,
) {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedWord } = useConfigStore();
  const [conjugationLoaded, setConjugationLoaded] = useState(false);
  const { dictionaryMetadata } = useConfigStore();

  const template = dictionaryMetadata?.[name!]?.tenses || {};
  const cloneTemplate = () => JSON.parse(JSON.stringify(template));
  const [conjugation, setConjugation] = useState<any>(() => cloneTemplate());

  const hasSameKeys = (conjugation: any, template: any) => {
    return isEqual(conjugation, template);
  };

  const getByIndex = (obj: any, indexes: number[]) => {
    return indexes.reduce((acc: any, idx: number) => {
      const values = Object.values(acc || {});
      console.log("Current object:", acc, "Values:", values, "Index:", idx);
      return idx >= 0 && idx < values.length ? values[idx] : undefined;
    }, obj);
  };

  const mergeConjugations = (conjugation: any, template: any) => {
    let newTemplate = JSON.parse(JSON.stringify(template));
    Object.keys(template).forEach((mode, modeIndex) => {
      console.log("Merging mode:", mode);
      Object.keys(template[mode]).forEach((form, formIndex) => {
        console.log("Merging form:", form);
        Object.keys(template[mode][form]).forEach((tense, tenseIndex) => {
          console.log("Merging tense:", tense);
          Object.keys(template[mode][form][tense]).forEach(
            (person, personIndex) => {
              console.log("Merging person:", person);
              const value = getByIndex(conjugation, [
                modeIndex,
                formIndex,
                tenseIndex,
                personIndex,
              ]);
              console.log(`Value for ${mode} ${form} ${tense} ${person}:`, value);
              if (value !== undefined && value !== null) {
                newTemplate[mode][form][tense][person] = value;
              }
            },
          );
        });
      });
    });
    console.log("Merged conjugation:", newTemplate);
    return newTemplate;
  };

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
        if (Object.keys(response).length === 0) {
          setConjugation(cloneTemplate());
        }
        else if (hasSameKeys(response, template)) {
          setConjugation(response);
        }
        else {
          const newTemplate = mergeConjugations(response, cloneTemplate());
          setConjugation(newTemplate);
        }
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
