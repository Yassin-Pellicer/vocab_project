import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationKey } from "@/notifications/registry";

export type NotificationHistoryKind =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "message";

export type NotificationHistorySource = NotificationKey | "error";

export type NotificationHistoryEntry = {
  id: string;
  at: number;
  kind: NotificationHistoryKind;
  sourceKey?: NotificationHistorySource;
  title: string;
  description?: string;
};

const MAX_ENTRIES = 200;

export type PushNotificationHistoryInput = {
  kind: NotificationHistoryKind;
  title: string;
  description?: string;
  sourceKey?: NotificationHistorySource;
};

interface NotificationHistoryContextState {
  entries: NotificationHistoryEntry[];
  lastReadAt: number;
  push: (input: PushNotificationHistoryInput) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
  markAllRead: () => void;
}

export const NotificationHistoryContext = create<NotificationHistoryContextState>()(
  persist(
    (set) => ({
      entries: [],
      lastReadAt: 0,
      push: (input) =>
        set((state) => {
          const entry: NotificationHistoryEntry = {
            id: crypto.randomUUID(),
            at: Date.now(),
            ...input,
          };
          return {
            entries: [entry, ...state.entries].slice(0, MAX_ENTRIES),
          };
        }),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clear: () => set({ entries: [], lastReadAt: Date.now() }),
      markAllRead: () => set({ lastReadAt: Date.now() }),
    }),
    { name: "vocab-notification-history" }
  )
);

export const pushNotificationHistory = (input: PushNotificationHistoryInput) => {
  NotificationHistoryContext.getState().push(input);
};
