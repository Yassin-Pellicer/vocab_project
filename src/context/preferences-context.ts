import { create } from "zustand";

export type Keybind = { action: string; keys: string[] };

interface ConfigState {
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

	// Actions
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

	// persistence
	loadConfig: () => void;
	saveConfig: () => void;
	resetConfig: () => void;
}

const STORAGE_KEY = "vocab_app_config_v1";

const defaultKeybinds: Keybind[] = [
	{ action: "New Word", keys: ["Ctrl", "N"] },
	{ action: "Search", keys: ["Ctrl", "K"] },
	{ action: "Save", keys: ["Ctrl", "S"] },
	{ action: "Quick Add", keys: ["Ctrl", "Shift", "A"] },
	{ action: "Settings", keys: ["Ctrl", ","] },
	{ action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
];

export const useConfigStore = create<ConfigState>((set, get) => ({
	// defaults
	notifications: true,
	notificationLifetime: "5s",
	language: "en",
	timezone: "utc",
	dateFormat: "ISO",

	animations: true,
	accentColor: "blue",
	appearance: "system",

	displayName: "",
	email: "",
	avatarPath: null,
	offline: false,

	keybinds: defaultKeybinds,

	subscriptionPlan: "Free",

	// actions
	setNotifications: (v: boolean) => set({ notifications: v }),
	setNotificationLifetime: (v: string) => set({ notificationLifetime: v }),
	setLanguage: (v: string) => set({ language: v }),
	setTimezone: (v: string) => set({ timezone: v }),
	setDateFormat: (v: string) => set({ dateFormat: v }),

	setAnimations: (v: boolean) => set({ animations: v }),
	setAccentColor: (v: string) => set({ accentColor: v }),
	setAppearance: (v: "light" | "dark" | "system") => set({ appearance: v }),

	setDisplayName: (v: string) => set({ displayName: v }),
	setEmail: (v: string) => set({ email: v }),
	setAvatarPath: (v?: string | null) => set({ avatarPath: v ?? null }),
	setOffline: (v: boolean) => set({ offline: v }),

	setKeybinds: (kb: Keybind[]) => set({ keybinds: kb }),
	updateKeybind: (index: number, kb: Keybind) =>
		set((state) => {
			const next = state.keybinds.slice();
			if (index >= 0 && index < next.length) next[index] = kb;
			return { keybinds: next };
		}),
	addKeybind: (kb: Keybind) =>
		set((state) => ({ keybinds: [...state.keybinds, kb] })),
	removeKeybind: (index: number) =>
		set((state) => ({ keybinds: state.keybinds.filter((_, i) => i !== index) })),

	setSubscriptionPlan: (plan: string) => set({ subscriptionPlan: plan }),

	// persistence
	loadConfig: () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			// only set keys that exist in parsed
			set((state) => ({
				...state,
				...(parsed.notifications !== undefined && { notifications: parsed.notifications }),
				...(parsed.notificationLifetime !== undefined && { notificationLifetime: parsed.notificationLifetime }),
				...(parsed.language !== undefined && { language: parsed.language }),
				...(parsed.timezone !== undefined && { timezone: parsed.timezone }),
				...(parsed.dateFormat !== undefined && { dateFormat: parsed.dateFormat }),
				...(parsed.animations !== undefined && { animations: parsed.animations }),
				...(parsed.accentColor !== undefined && { accentColor: parsed.accentColor }),
				...(parsed.appearance !== undefined && { appearance: parsed.appearance }),
				...(parsed.displayName !== undefined && { displayName: parsed.displayName }),
				...(parsed.email !== undefined && { email: parsed.email }),
				...(parsed.avatarPath !== undefined && { avatarPath: parsed.avatarPath }),
				...(parsed.offline !== undefined && { offline: parsed.offline }),
				...(parsed.keybinds !== undefined && { keybinds: parsed.keybinds }),
				...(parsed.subscriptionPlan !== undefined && { subscriptionPlan: parsed.subscriptionPlan }),
			}));
		} catch (e) {
			// ignore parse errors
			// eslint-disable-next-line no-console
			console.warn("Failed to load config from storage", e);
		}
	},
	saveConfig: () => {
		try {
			const state = get();
			const toSave = {
				notifications: state.notifications,
				notificationLifetime: state.notificationLifetime,
				language: state.language,
				timezone: state.timezone,
				dateFormat: state.dateFormat,
				animations: state.animations,
				accentColor: state.accentColor,
				appearance: state.appearance,
				displayName: state.displayName,
				email: state.email,
				avatarPath: state.avatarPath,
				offline: state.offline,
				keybinds: state.keybinds,
				subscriptionPlan: state.subscriptionPlan,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn("Failed to save config to storage", e);
		}
	},
	resetConfig: () => {
		set({
			notifications: true,
			notificationLifetime: "5s",
			language: "en",
			timezone: "utc",
			dateFormat: "ISO",
			animations: true,
			accentColor: "blue",
			appearance: "system",
			displayName: "",
			email: "",
			avatarPath: null,
			offline: false,
			keybinds: defaultKeybinds,
			subscriptionPlan: "Free",
		});
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
	},
}));

// Automatically attempt to load persisted config when module is imported
try {
	// Guards for SSR / non-browser env
	if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
		const store = useConfigStore.getState();
		store.loadConfig();
	}
} catch (e) {
	// ignore
}

