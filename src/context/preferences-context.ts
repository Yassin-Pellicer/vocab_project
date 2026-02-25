import { create } from "zustand";
import { Keybind, UserPreferences } from "@/types/config";

interface ConfigState {
  config: UserPreferences;

  setConfig: (config: Partial<UserPreferences>) => void;

  setNotifications: (v: boolean) => void;
  setNotificationLifetime: (v: string) => void;
  setLanguage: (v: string) => void;
  setTimezone: (v: string) => void;
  setDateFormat: (v: string) => void;

  setAnimations: (v: boolean) => void;
  setAccentColor: (v: string) => void;
  setAppearance: (v: "light" | "dark" | "system") => void;

  setDisplayName: (v: string) => void;
  setEmail: (v: string) => void;
  setAvatarPath: (v?: string | null) => void;
  setOffline: (v: boolean) => void;

  setKeybinds: (kb: Keybind[]) => void;
  updateKeybind: (index: number, kb: Keybind) => void;
  addKeybind: (kb: Keybind) => void;
  removeKeybind: (index: number) => void;

  setSubscriptionPlan: (plan: string) => void;

  loadConfig: () => void;
  saveConfig: () => void;
  resetConfig: () => void;
}

const defaultKeybinds: Keybind[] = [
  { action: "New Word", keys: ["Ctrl", "N"] },
  { action: "Search", keys: ["Ctrl", "K"] },
  { action: "Save", keys: ["Ctrl", "S"] },
  { action: "Quick Add", keys: ["Ctrl", "Shift", "A"] },
  { action: "Settings", keys: ["Ctrl", ","] },
  { action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
];

const defaultConfig: UserPreferences = {
	notifications: true,
	notificationLifetime: "5",
	language: "en",
	timezone: "utc",
	dateFormat: "ISO",

	animations: true,
	accentColor: "blue",
	appearance: "dark",

	displayName: "",
	email: "",
	avatarPath: null,
	offline: false,

	keybinds: defaultKeybinds,

	subscriptionPlan: "Free",
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: { ...defaultConfig },

  setConfig: (config: Partial<UserPreferences>) =>
    set((state) => ({ config: { ...state.config, ...config } })),

  setNotifications: (v: boolean) =>
    set((state) => ({ config: { ...state.config, notifications: v } })),
  setNotificationLifetime: (v: string) =>
    set((state) => ({ config: { ...state.config, notificationLifetime: v } })),
  setLanguage: (v: string) =>
    set((state) => ({ config: { ...state.config, language: v } })),
  setTimezone: (v: string) =>
    set((state) => ({ config: { ...state.config, timezone: v } })),
  setDateFormat: (v: string) =>
    set((state) => ({ config: { ...state.config, dateFormat: v } })),

  setAnimations: (v: boolean) =>
    set((state) => ({ config: { ...state.config, animations: v } })),
  setAccentColor: (v: string) =>
    set((state) => ({ config: { ...state.config, accentColor: v } })),
  setAppearance: (v: "light" | "dark" | "system") =>
    set((state) => ({ config: { ...state.config, appearance: v } })),

  setDisplayName: (v: string) =>
    set((state) => ({ config: { ...state.config, displayName: v } })),
  setEmail: (v: string) =>
    set((state) => ({ config: { ...state.config, email: v } })),
  setAvatarPath: (v?: string | null) =>
    set((state) => ({ config: { ...state.config, avatarPath: v ?? null } })),
  setOffline: (v: boolean) =>
    set((state) => ({ config: { ...state.config, offline: v } })),

  setKeybinds: (kb: Keybind[]) =>
    set((state) => ({ config: { ...state.config, keybinds: kb } })),
  updateKeybind: (index: number, kb: Keybind) =>
    set((state) => {
			if(state.config.keybinds === undefined) return state;
      const next = state.config.keybinds.slice();
      if (index >= 0 && index < next.length) next[index] = kb;
      return { config: { ...state.config, keybinds: next } };
    }),
  addKeybind: (kb: Keybind) =>
    set((state) => {
      if(state.config.keybinds === undefined) return state;
      return {
        config: { ...state.config, keybinds: [...state.config.keybinds, kb] },
      };
    }),
  removeKeybind: (index: number) =>
    set((state) => {
      if(state.config.keybinds === undefined) return state;
      return {
        config: {
          ...state.config,
          keybinds: state.config.keybinds.filter((_, i) => i !== index),
        },
      };
    }),

  setSubscriptionPlan: (plan: string) =>
    set((state) => ({ config: { ...state.config, subscriptionPlan: plan } })),

  loadConfig: () => {
		window.api.loadUserPreferences().then((preferences: UserPreferences) => {
			set({ config: { ...defaultConfig, ...preferences } });
		})
		console.log("Loaded user preferences");
	},
  saveConfig: () => {
		window.api.saveUserPreferences(useConfigStore.getState().config);
	},
  resetConfig: () => set({ config: { ...defaultConfig } }),
}));
