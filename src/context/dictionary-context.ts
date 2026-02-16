import { create } from "zustand";
import { TranslationEntry } from "@/types/translation-entry";

interface ConfigState {
  dictionaryMetadata: Record<string, any>;
  data: { navMain: NavItem[] };
  dictionaries: Record<string, TranslationEntry[]>;
  selectedWord: TranslationEntry | null;
  selectedLetter: string;
  searchField: string;
  isFlipped: boolean;
  dualView: boolean;
  selectedTypes: string[];
  graphMode: boolean;

  setDictionaryMetadata: (metadata: Record<string, any>) => void;
  setDictionaries: (dictionaries: Record<string, TranslationEntry[]>) => void;
  setSelectedWord: (word: TranslationEntry | null) => void;
  setSelectedLetter: (letter: string) => void;
  setSearchField: (field: string) => void;
  setIsFlipped: (flipped: boolean) => void;
  setDualView: (dual: boolean) => void;
  setSelectedTypes: (types: string[]) => void;
  setGraphMode: (mode: boolean) => void;

  toggleType: (type: string) => void;
  loadConfig: () => Promise<void>;
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

  setDictionaryMetadata: (metadata) =>
    set({ dictionaryMetadata: metadata }),

  setDictionaries: (dictionaries) =>
    set({ dictionaries }),

  setSelectedWord: (word) =>
    set({ selectedWord: word }),

  setSelectedLetter: (letter) =>
    set({ selectedLetter: letter }),

  setSearchField: (field) =>
    set({ searchField: field }),

  setIsFlipped: (flipped) =>
    set({ isFlipped: flipped }),

  setDualView: (dual) =>
    set({ dualView: dual }),

  setSelectedTypes: (types) =>
    set({ selectedTypes: types }),

  toggleType: (type) => {
    const current = get().selectedTypes;
    set({
      selectedTypes: current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type],
    });
  },
  setGraphMode: (mode) =>
    set({ graphMode: mode }),

  loadConfig: async () => {
    try {
      const config = await window.api.loadConfig();

      const languageItems = Object.entries(config.dictionaries || {}).map(
        ([key, dict]: [string, any]) => ({
          title: dict.name,
          url: "",
          items: [
            {
              title: "Dictionary",
              icon: "BookOpen",
              url: `/dictionary?name=${encodeURIComponent(key)}&path=${encodeURIComponent(dict.route)}`,
            },
            {
              title: "Translate",
              icon: "Languages",
              url: `/translation?name=${encodeURIComponent(key)}&path=${encodeURIComponent(dict.route)}`,
            },
          ],
        })
      );
      console.log("Loaded config:", config);
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

      set(state => ({
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
        console.log(`Loaded translations for ${key}:`, data);
        if (data) {
          newDictionaries[key] = data;
        }
      } catch (error) {
        console.error(`Failed to load JSON for ${key}:`, error);
      }
    }
    console.log("Loaded all translations:", newDictionaries);
    set({ dictionaries: newDictionaries });
  },
}));
