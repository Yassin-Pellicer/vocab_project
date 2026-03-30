import { create } from "zustand";
import { TranslationEntry } from "@/types/translation-entry";
import { Dictionary } from "@/types/config";
import { BookAIcon, BookOpen } from "lucide-react";
import type { NavItem } from "@/types/nav-item";

interface DictionaryContext {
  dictionaryMetadata: Record<string, Dictionary>;
  sidebarNavigationData: { navMain: NavItem[] };
  dictionaries: Record<string, TranslationEntry[]>;
  selectedWord: TranslationEntry | null;
  selectedLetter: string;
  searchField: string;
  isFlipped: boolean;
  selectedTypes: string[];
  graphMode: boolean;

  setDictionaryMetadata: (metadata: Record<string, Dictionary>) => void;
  setDictionaries: (dictionaries: Record<string, TranslationEntry[]>) => void;
  setSelectedWord: (word: TranslationEntry | null) => void;
  setSelectedLetter: (letter: string) => void;
  setSearchField: (field: string) => void;
  setIsFlipped: (flipped: boolean) => void;
  setSelectedTypes: (types: string[]) => void;
  setGraphMode: (mode: boolean) => void;

  toggleType: (type: string) => void;

  setDictionaryTenses: (
    key: string,
    tenses: Record<string, Record<string, Record<string, string>>>,
  ) => void;

  setDictionaryArticles: (
    key: string,
    articles: Record<string, Record<string, string>>,
  ) => void;

  setDictionaryTypeWords: (key: string, types: string[]) => void;
  setDictionaryUseTenses: (key: string, value: boolean) => void;
  setDictionaryUseArticles: (key: string, value: boolean) => void;

  setDictionaryGenders: (key: string, genders: string[]) => void;
  setDictionaryNumbers: (key: string, numbers: string[]) => void;

  setTypeWordWithPrecededArticle: (key: string, typeWord: string) => void;
  setTypeWordWithTenses: (key: string, typeWord: string) => void;

  loadConfig: () => Promise<void>;
  editConfig: () => Promise<void>;
  loadTranslations: (route: string, name: string) => Promise<void>;
  loadAllTranslations: () => Promise<void>;
}

export const DictionaryContext = create<DictionaryContext>((set, get) => {
  const updateDictionary = (
    key: string,
    updater: (current: Dictionary) => Dictionary,
  ) => {
    set((state) => {
      const current = state.dictionaryMetadata[key];
      if (!current) return state;
      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: updater(current),
        },
      };
    });
  };

  return {
    dictionaryMetadata: {},
    dictionaries: {},
    sidebarNavigationData: {
      navMain: [{ title: "Home", url: "/" }],
    },

    selectedWord: null,
    selectedLetter: "A",
    searchField: "",
    isFlipped: false,
    selectedTypes: [],
    graphMode: false,

    setDictionaryMetadata: (metadata) => set({ dictionaryMetadata: metadata }),
    setDictionaries: (dictionaries) => set({ dictionaries }),
    setSelectedWord: (word) => set({ selectedWord: word }),
    setSelectedLetter: (letter) => set({ selectedLetter: letter }),
    setSearchField: (field) => set({ searchField: field }),
    setIsFlipped: (flipped) => set({ isFlipped: flipped }),
    setSelectedTypes: (types) => set({ selectedTypes: types }),
    setGraphMode: (mode) => set({ graphMode: mode }),

    toggleType: (type) => {
      const current = get().selectedTypes;
      set({
        selectedTypes: current.includes(type)
          ? current.filter((t) => t !== type)
          : [...current, type],
      });
    },

    setDictionaryTenses: (key, tenses) =>
      updateDictionary(key, (d) => ({ ...d, tenses })),

    setDictionaryArticles: (key, articles) =>
      updateDictionary(key, (d) => ({ ...d, articles })),

    setDictionaryTypeWords: (key, types) =>
      updateDictionary(key, (d) => ({ ...d, typeWords: types })),

    setDictionaryUseTenses: (key, value) =>
      updateDictionary(key, (d) => ({ ...d, useTenses: value })),

    setDictionaryUseArticles: (key, value) =>
      updateDictionary(key, (d) => ({ ...d, useArticles: value })),

    setDictionaryGenders: (key, genders) =>
      updateDictionary(key, (d) => ({ ...d, genders })),

    setDictionaryNumbers: (key, numbers) =>
      updateDictionary(key, (d) => ({ ...d, numbers })),

    setTypeWordWithPrecededArticle: (key, typeWord) =>
      updateDictionary(key, (d) => ({
        ...d,
        typeWordWithPrecededArticle: typeWord,
      })),

    setTypeWordWithTenses: (key, typeWord) =>
      updateDictionary(key, (d) => ({ ...d, typeWordWithTenses: typeWord })),

    editConfig: async () => {
      const metadata = get().dictionaryMetadata;
      try {
        await window.api.editConfig({ dictionaries: metadata });
      } catch (error) {
        console.error("Error saving dictionary config:", error);
      }
    },

    loadConfig: async () => {
      try {
        const config = await window.api.loadConfig();

        const dictionaries: Record<string, Dictionary> =
          config.dictionaries ?? {};

        const dictionaryNavEntry: NavItem[] = Object.entries(dictionaries).map(
          ([key, dict]) => ({
            key,
            title: dict.name,
            route: dict.route,
            items: [
              {
                title: "Dictionary",
                icon: BookOpen,
                url: `/dictionary?name=${encodeURIComponent(
                  key,
                )}&path=${encodeURIComponent(dict.route)}`,
              },
              {
                title: "Notes",
                icon: BookAIcon,
                url: `/notes?name=${encodeURIComponent(
                  key,
                )}&path=${encodeURIComponent(dict.route)}`,
              },
            ],
          }),
        );
        set({
          dictionaryMetadata: dictionaries,
          sidebarNavigationData: {
            navMain: [{ title: "Home", url: "/" }, ...dictionaryNavEntry],
          },
        });
      } catch (error) {
        console.error("Error loading config:", error);
      }
    },

    loadTranslations: async (route, name) => {
      try {
        const data = await window.api.requestTranslations(route, name);
        if (!data) return;

        set((state) => ({
          dictionaries: {
            ...state.dictionaries,
            [name]: data,
          },
        }));
      } catch (error) {
        console.error(`Failed to load translations for ${name}:`, error);
      }
    },

    loadAllTranslations: async () => {
      const metadata = get().dictionaryMetadata;
      const newDictionaries: Record<string, TranslationEntry[]> = {};

      for (const [key, dict] of Object.entries(metadata)) {
        try {
          const data = await window.api.requestTranslations(dict.route, key);
          if (data) newDictionaries[key] = data;
        } catch (error) {
          console.error(`Failed to load JSON for ${key}:`, error);
        }
      }

      set({ dictionaries: newDictionaries });
    },
  };
});
