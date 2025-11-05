import { TranslationEntry } from "@/types/translation-entry";
import { create } from "zustand";

interface Dictionary {
  name: string;
  path: string;
}

interface NavItem {
  title: string;
  url: string;
  items?: NavItem[];
}

interface ConfigState {
  list: TranslationEntry[];
  data: {
    navMain: NavItem[];
  };
  loadConfig: () => Promise<void>;
  setList: (list: TranslationEntry[]) => void;
  loadTranslations: (route: string, name: string) => Promise<void>;
}

export const useConfigStore = create<ConfigState>()((set) => {
  const list = [] as TranslationEntry[];
  const setList = (list: TranslationEntry[]) => set({ list });

  const loadConfig = async () => {
    try {
      const config = await window.api.loadConfig();
      const dictItems = (config.dictionaries || []).map((dict: Dictionary) => ({
        title: dict.name,
        url: `/dictionary?name=${encodeURIComponent(
          dict.name
        )}&path=${encodeURIComponent(dict.path)}`,
      }));

      set((state) => ({
        data: {
          ...state.data,
          navMain: state.data.navMain.map((item) =>
            item.title === "Dictionaries" ? { ...item, items: dictItems } : item
          ),
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
      navMain: [
        { title: "Home", url: "#" },
        { title: "Dictionaries", url: "", items: [] },
        {
          title: "Practice",
          url: "#",
          items: [
            { title: "Translate!", url: "/translation" },
            { title: "Flashcards", url: "" },
          ],
        },
      ],
    },
    loadConfig,
    loadTranslations,
    list,
    setList: (list: TranslationEntry[]) => set({ list }),
  };
});

export default useConfigStore;
