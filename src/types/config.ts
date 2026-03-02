export interface Dictionary {
  name: string;
  route: string;
  tenses?: Record<string, Record<string, Record<string, string>>>;
  articles?: Record<string, Record<string, string>>;

  typeWords?: string[];
  useTenses?: boolean;
  useArticles?: boolean;

  genders?: string[];
  numbers?: string[];
}
export interface UserConfig {
  dictionaries?: Record<string, Dictionary>;
}

export type Keybind = { action: string; keys: string[] };

export const PRESET_KEYBINDS: Keybind[] = [
  { action: "New Word", keys: ["Ctrl", "N"] },
  { action: "Search", keys: ["Ctrl", "K"] },
  { action: "Save", keys: ["Ctrl", "S"] },
  { action: "Quick Add", keys: ["Ctrl", "Shift", "A"] },
  { action: "Settings", keys: ["Ctrl", ","] },
  { action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
];

export interface UserPreferences {
  notifications?: boolean;
  notificationLifetime?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;

  animations?: boolean;
  accentColor?: string;
  appearance?: "light" | "dark" | "system";

  displayName?: string;
  email?: string;
  avatarPath?: string | null;
  offline?: boolean;

  keybinds?: Keybind[];

  subscriptionPlan?: string;
}

export const defaultTenses = {
  Indicative: {
    Simple: {
      Present: { "1s": "", "2s": "", "3s": "", "1p": "", "2p": "", "3p": "" },
      Preteritum: {
        "1s": "",
        "2s": "",
        "3s": "",
        "1p": "",
        "2p": "",
        "3p": "",
      },
      Future: { "1s": "", "2s": "", "3s": "", "1p": "", "2p": "", "3p": "" },
    },
    Compound: {
      "Present Perfect": { "1s": "", "2s": "", "3s": "", "1p": "", "2p": "", "3p": "" },
      "Past Perfect": {
        "1s": "",
        "2s": "",
        "3s": "",
        "1p": "",
        "2p": "",
        "3p": "",
      },
      "Futur I": { "1s": "", "2s": "", "3s": "", "1p": "", "2p": "", "3p": "" },
      "Futur II": {
        "1s": "",
        "2s": "",
        "3s": "",
        "1p": "",
        "2p": "",
        "3p": "",
      },
    },
  },
  Subjunctive: {
    "Simple": {
      Present: { "1s": "", "2s": "", "3s": "", "1p": "", "2p": "", "3p": "" },
    },
    "Compound": {
      "Preteritum": {
        "1s": "",
        "2s": "",
        "3s": "",
        "1p": "",
        "2p": "",
        "3p": "",
      },
      "Past Perfect": {
        "1s": "",
        "2s": "",
        "3s": "",
        "1p": "",
        "2p": "",
        "3p": "",
      },
    },
  },
  Imperative: {
    "Simple": {
      "Imperative": { "2s": "", "2p": "", "3p": "" },
    },
  },
};
