/** A single dictionary entry in the user config. */
export interface DictionaryEntry {
  name: string;
  route: string;
}

/** The JSON structure of user-config.json (dictionaries metadata). */
export interface UserConfig {
  dictionaries?: Record<string, DictionaryEntry>;
}

/** A keyboard shortcut binding. */
export type Keybind = { action: string; keys: string[] };

/** The JSON structure of user preferences (persisted in localStorage). */
export interface UserPreferences {
  // General
  notifications: boolean;
  notificationLifetime: string;
  language: string;
  timezone: string;
  dateFormat: string;

  // Looks & Feel
  animations: boolean;
  accentColor: string;
  appearance: "light" | "dark" | "system";

  // Profile
  displayName: string;
  email: string;
  avatarPath?: string | null;
  offline: boolean;

  // Keybinds
  keybinds: Keybind[];

  // Subscription
  subscriptionPlan: string;
}
