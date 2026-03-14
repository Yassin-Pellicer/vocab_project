import { create } from "zustand";
import { Keybind, PRESET_KEYBINDS, UserPreferences } from "@/types/config";
import { notify } from "@/services/notify";
import { setNotificationSettings } from "@/services/notification-settings";
import { parseDurationMs } from "@/lib/parse-duration";

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
  addKeybind: (kb: Keybind, index: number) => void;
  removeKeybind: (index: number) => void;

  setSubscriptionPlan: (plan: string) => void;

  loadConfig: () => void;
  saveConfig: () => void;
  resetConfig: () => void;
}

const defaultConfig: UserPreferences = {
  notifications: true,
  notificationLifetime: "5s",
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

  keybinds: PRESET_KEYBINDS,

  subscriptionPlan: "Free",
};

setNotificationSettings({
  enabled: defaultConfig.notifications,
  durationMs: parseDurationMs(defaultConfig.notificationLifetime) ?? 5000,
});

export const useConfigStore = create<ConfigState>((set) => ({
  config: { ...defaultConfig },

  setConfig: (config: Partial<UserPreferences>) => {
    set((state) => ({ config: { ...state.config, ...config } }));
    const next = useConfigStore.getState().config;
    setNotificationSettings({
      enabled: next.notifications,
      durationMs: parseDurationMs(next.notificationLifetime) ?? 5000,
    });
    useConfigStore.getState().saveConfig();
  },

  setNotifications: (v: boolean) => {
    set((state) => ({ config: { ...state.config, notifications: v } }));
    setNotificationSettings({ enabled: v });
    useConfigStore.getState().saveConfig();
  },
  setNotificationLifetime: (v: string) => {
    set((state) => ({ config: { ...state.config, notificationLifetime: v } }));
    setNotificationSettings({ durationMs: parseDurationMs(v) ?? 5000 });
    useConfigStore.getState().saveConfig();
  },
  setLanguage: (v: string) => {
    set((state) => ({ config: { ...state.config, language: v } }));
    useConfigStore.getState().saveConfig();
  },
  setTimezone: (v: string) => {
    set((state) => ({ config: { ...state.config, timezone: v } }));
    useConfigStore.getState().saveConfig();
  },
  setDateFormat: (v: string) => {
    set((state) => ({ config: { ...state.config, dateFormat: v } }));
    useConfigStore.getState().saveConfig();
  },

  setAnimations: (v: boolean) => {
    set((state) => ({ config: { ...state.config, animations: v } }));
    useConfigStore.getState().saveConfig();
  },
  setAccentColor: (v: string) => {
    set((state) => ({ config: { ...state.config, accentColor: v } }));
    useConfigStore.getState().saveConfig();
  },
  setAppearance: (v: "light" | "dark" | "system") => {
    set((state) => ({ config: { ...state.config, appearance: v } }));
    useConfigStore.getState().saveConfig();
  },

  setDisplayName: (v: string) => {
    set((state) => ({ config: { ...state.config, displayName: v } }));
    useConfigStore.getState().saveConfig();
  },
  setEmail: (v: string) => {
    set((state) => ({ config: { ...state.config, email: v } }));
    useConfigStore.getState().saveConfig();
  },
  setAvatarPath: (v?: string | null) => {
    set((state) => ({ config: { ...state.config, avatarPath: v ?? null } }));
    useConfigStore.getState().saveConfig();
  },
  setOffline: (v: boolean) => {
    set((state) => ({ config: { ...state.config, offline: v } }));
    useConfigStore.getState().saveConfig();
  },

  setKeybinds: (kb: Keybind[]) => {
    set((state) => ({ config: { ...state.config, keybinds: kb } }));
    useConfigStore.getState().saveConfig();
  },
  updateKeybind: (index: number, kb: Keybind) => {
    set((state) => {
      if (state.config.keybinds === undefined) return state;
      const next = state.config.keybinds.slice();
      if (index >= 0 && index < next.length) next[index] = kb;
      return { config: { ...state.config, keybinds: next } };
    });
    useConfigStore.getState().saveConfig();
  },
  addKeybind: (kb: Keybind, index: number) => {
    set((state) => {
      if (state.config.keybinds === undefined) return state;
      const next = state.config.keybinds.slice();
      if (index >= 0 && index < next.length) next[index] = kb;
      return { config: { ...state.config, keybinds: next } };
    });
    useConfigStore.getState().saveConfig();
  },
  removeKeybind: (index: number) => {
    set((state) => {
      if (state.config.keybinds === undefined) return state;
      const next = state.config.keybinds.slice();
      if (index >= 0 && index < next.length) {
        next[index] = { ...next[index], keys: [] };
      }
      return {
        config: {
          ...state.config,
          keybinds: next,
        },
      };
    });
    useConfigStore.getState().saveConfig();
  },

  setSubscriptionPlan: (plan: string) => {
    set((state) => ({ config: { ...state.config, subscriptionPlan: plan } }));
    useConfigStore.getState().saveConfig();
  },

  loadConfig: () => {
    window.api.loadUserPreferences().then((preferences: UserPreferences) => {
      const merged = { ...defaultConfig, ...preferences };
      set({ config: merged });
      setNotificationSettings({
        enabled: merged.notifications,
        durationMs: parseDurationMs(merged.notificationLifetime) ?? 5000,
      });
    });
    console.log("Loaded user preferences");
  },
  saveConfig: () => {
    Promise.resolve(
      window.api.saveUserPreferences(useConfigStore.getState().config),
    )
      .then(() => notify("configSaved", { scope: "preferences" }))
      .catch((err) => console.error("Error saving user preferences:", err));
  },
  resetConfig: () => set({ config: { ...defaultConfig } }),
}));
