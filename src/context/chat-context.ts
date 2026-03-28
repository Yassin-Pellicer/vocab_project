import { create } from "zustand";
import type { Conversation } from "@/types/chat";

type ChatContext = {
  conversations: Record<string, Conversation>;
  setConversation: (key: string, conversation: Conversation) => void;
  updateConversation: (key: string, update: Partial<Conversation>) => void;
  clearConversation: (key: string) => void;
};

const emptyConversation: Conversation = { messages: [], draft: "" };
const STORAGE_KEY = "chat:conversations:v1";

const readStoredConversations = (): Record<string, Conversation> => {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, Conversation> : {};
  } catch {
    return {};
  }
};

const writeStoredConversations = (conversations: Record<string, Conversation>) => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // ignore storage failures (quota, privacy mode)
  }
};

export const ChatContext = create<ChatContext>((set, get) => ({
  conversations: readStoredConversations(),

  setConversation: (key, conversation) =>
    set((state) => {
      const next = { ...state.conversations, [key]: conversation };
      writeStoredConversations(next);
      return { conversations: next };
    }),

  updateConversation: (key, update) => {
    const current = get().conversations[key] ?? emptyConversation;
    set((state) => {
      const next = {
        ...state.conversations,
        [key]: { ...current, ...update },
      };
      writeStoredConversations(next);
      return { conversations: next };
    });
  },

  clearConversation: (key) =>
    set((state) => {
      const next = {
        ...state.conversations,
        [key]: emptyConversation,
      };
      writeStoredConversations(next);
      return { conversations: next };
    }),
}));
