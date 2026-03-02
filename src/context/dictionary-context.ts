import { create } from "zustand";
import { TranslationEntry } from "@/types/translation-entry";
import { Dictionary } from "@/types/config";

interface ConfigState {
  dictionaryMetadata: Record<string, Dictionary>;
  data: { navMain: NavItem[] };
  dictionaries: Record<string, TranslationEntry[]>;
  selectedWord: TranslationEntry | null;
  selectedLetter: string;
  searchField: string;
  isFlipped: boolean;
  dualView: boolean;
  selectedTypes: string[];
  graphMode: boolean;

  setDictionaryMetadata: (metadata: Record<string, Dictionary>) => void;
  setDictionaries: (dictionaries: Record<string, TranslationEntry[]>) => void;
  setSelectedWord: (word: TranslationEntry | null) => void;
  setSelectedLetter: (letter: string) => void;
  setSearchField: (field: string) => void;
  setIsFlipped: (flipped: boolean) => void;
  setDualView: (dual: boolean) => void;
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
  saveConfig: () => Promise<void>;
  editConfig: () => Promise<void>;
  loadTranslations: (route: string, name: string) => Promise<void>;
  loadAllTranslations: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  dictionaryMetadata: {},
  dictionaries: {},
  data: { navMain: [{ title: "Home", url: "/" }] },
  selectedWord: null,
  selectedLetter: "A",
  searchField: "",
  isFlipped: false,
  dualView: true,
  selectedTypes: [],
  graphMode: false,

  setDictionaryMetadata: (metadata) => {
    set({ dictionaryMetadata: metadata });
    get().saveConfig();
  },

  setDictionaries: (dictionaries) => set({ dictionaries }),
  setSelectedWord: (word) => set({ selectedWord: word }),
  setSelectedLetter: (letter) => set({ selectedLetter: letter }),
  setSearchField: (field) => set({ searchField: field }),
  setIsFlipped: (flipped) => set({ isFlipped: flipped }),
  setDualView: (dual) => set({ dualView: dual }),
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

  setDictionaryTenses: (key, tenses) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;

      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            tenses,
          },
        },
      };
    });

    get().editConfig();
  },

  setDictionaryArticles: (key, articles) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;

      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            articles,
          },
        },
      };
    });

    get().editConfig();
  },

  setDictionaryTypeWords: (key, types) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;

      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            typeWords: types,
          },
        },
      };
    });

    get().editConfig();
  },

  setDictionaryGenders: (key, genders) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;
      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            genders,
          },
        },
      };
    });
    get().editConfig();
  },

  setDictionaryNumbers: (key, numbers) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;
      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            numbers,
          },
        },
      };
    });
    get().editConfig();
  },

  setDictionaryUseTenses: (key, value) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;

      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            useTenses: value,
          },
        },
      };
    });

    get().editConfig();
  },

  setDictionaryUseArticles: (key: string, value: boolean) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;

      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            useArticles: value,
          },
        },
      };
    });

    get().editConfig();
  },

  setTypeWordWithPrecededArticle: (key, typeWord) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;
      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            typeWordWithPrecededArticle: typeWord,
          },
        },
      };
    });
    get().editConfig();
  },

  setTypeWordWithTenses: (key, typeWord) => {
    set((state) => {
      if (!state.dictionaryMetadata[key]) return state;
      return {
        dictionaryMetadata: {
          ...state.dictionaryMetadata,
          [key]: {
            ...state.dictionaryMetadata[key],
            typeWordWithTenses: typeWord,
          },
        },
      };
    });
    get().editConfig();
  },

  saveConfig: async () => {
    const metadata = get().dictionaryMetadata;
    try {
      await window.api.saveConfig({ dictionaries: metadata });
    } catch (err) {
      console.error("Error saving dictionary config:", err);
    }
  },

  editConfig: async () => {
    const metadata = get().dictionaryMetadata;
    try {
      await window.api.editConfig({ dictionaries: metadata });
    } catch (err) {
      console.error("Error saving dictionary config:", err);
    }
  },

  loadConfig: async () => {
    try {
      const config = await window.api.loadConfig();

      const languageItems = Object.entries(config.dictionaries || {}).map(
        ([key, dict]: [string, any]) => ({
          title: dict.name,
          url: "",
          key,
          route: dict.route,
          items: [
            {
              title: "Dictionary",
              icon: "BookOpen",
              url: `/dictionary?name=${encodeURIComponent(
                key,
              )}&path=${encodeURIComponent(dict.route)}`,
            },
            {
              title: "Translate",
              icon: "Languages",
              url: `/translation?name=${encodeURIComponent(
                key,
              )}&path=${encodeURIComponent(dict.route)}`,
            },
          ],
        }),
      );

      set({
        dictionaryMetadata: config.dictionaries || {},
        data: {
          navMain: [{ title: "Home", url: "/" }, ...languageItems],
        },
      });
    } catch (err) {
      console.error("Error loading config:", err);
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
        if (data) {
          newDictionaries[key] = data;
        }
      } catch (error) {
        console.error(`Failed to load JSON for ${key}:`, error);
      }
    }

    set({ dictionaries: newDictionaries });
  },
}));
