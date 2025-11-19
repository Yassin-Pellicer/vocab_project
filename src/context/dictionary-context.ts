import { TranslationEntry } from "@/types/translation-entry";
import { create } from "zustand";

interface Dictionary {
  name: string;
  path: string;
}

interface NavItem {
  title: string;
  url: string;
  icon?: string;
  items?: NavItem[];
}

interface ConfigState {
  list: TranslationEntry[];
  selectedWord: TranslationEntry | null;
  data: {
    navMain: NavItem[];
  };
  selectedLetter: string;
  setSelectedLetter: (letter: string) => void;
  searchField: string;
  setSearchField: (field: string) => void;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  loadConfig: () => Promise<void>;
  setList: (list: TranslationEntry[]) => void;
  loadTranslations: (route: string, name: string) => Promise<void>;
  setSelectedWord: (word: TranslationEntry | null) => void;
}

export const useConfigStore = create<ConfigState>()((set) => {
  const list: TranslationEntry[] = [];
  const selectedLetter = "A";
  const searchField = "";
  const isFlipped = false;
  const setList = (list: TranslationEntry[]) => set({ list });
  const setSelectedLetter = (letter: string) => set({ selectedLetter: letter });
  const setSearchField = (field: string) => set({ searchField: field });
  const setIsFlipped = (flipped: boolean) => set({ isFlipped: flipped });
  const setSelectedWord = (word: TranslationEntry | null) =>
    set({ selectedWord: word });

  const loadConfig = async () => {
    try {
      const config = await window.api.loadConfig();
      const languageItems = Object.entries(config.dictionaries || {}).map(
        ([_key, dict]: [any, any]) => ({
          title: dict.name,
          url: "",
          items: [
            {
              title: "Dictionary",
              icon: "BookOpen",
              url: `/dictionary?name=${encodeURIComponent(
                _key
              )}&path=${encodeURIComponent(dict.route)}`,
            },
            {
              title: "Translate",
              icon: "Languages",
              url: `/translation?name=${encodeURIComponent(
                _key
              )}&path=${encodeURIComponent(dict.route)}`,
            },
          ],
        })
      );

      set(() => ({
        data: {
          navMain: [
            { title: "Home", url: "/" },
            ...languageItems,
          ],
        },
      }));
    } catch (err) {
      console.error("Error loading config:", err);
    }
  };

  const loadTranslations = async (route: string, name: string) => {
    try {
      const data = await (window.api as any).requestTranslations(route, name);
      if (data) {
        setList(data);
      }
    } catch (error) {
      console.error("Failed to load JSON:", error);
    }
  };

  return {
    data: {
      navMain: [],
    },
    list,
    selectedWord: null,
    selectedLetter,
    setSelectedWord,
    loadConfig,
    loadTranslations,
    setSelectedLetter,
    setSearchField,
    searchField,
    setList,
    isFlipped,
    setIsFlipped,
  };
});

export default useConfigStore;
