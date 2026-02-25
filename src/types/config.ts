export interface DictionaryEntry {
  name: string;
  route: string;
}

export interface UserConfig {
  dictionaries?: Record<string, DictionaryEntry>;
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
  // General
  notifications?: boolean;
  notificationLifetime?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;

  // Looks & Feel
  animations?: boolean;
  accentColor?: string;
  appearance?: "light" | "dark" | "system";

  // Profile
  displayName?: string;
  email?: string;
  avatarPath?: string | null;
  offline?: boolean;

  // Keybinds
  keybinds?: Keybind[];

  // Subscription
  subscriptionPlan?: string;
}
