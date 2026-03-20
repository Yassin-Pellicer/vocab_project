import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

type Conversation = {
  messages: ChatMessage[];
  draft: string;
};

type ChatState = {
  conversations: Record<string, Conversation>;
  setConversation: (key: string, conversation: Conversation) => void;
  updateConversation: (key: string, update: Partial<Conversation>) => void;
  clearConversation: (key: string) => void;
};

const emptyConversation: Conversation = { messages: [], draft: "" };

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  setConversation: (key, conversation) =>
    set((state) => ({
      conversations: { ...state.conversations, [key]: conversation },
    })),
  updateConversation: (key, update) => {
    const current = get().conversations[key] ?? emptyConversation;
    set((state) => ({
      conversations: {
        ...state.conversations,
        [key]: { ...current, ...update },
      },
    }));
  },
  clearConversation: (key) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [key]: emptyConversation,
      },
    })),
}));
