import { ipcRenderer } from "electron";
import type { ChatMessage } from "@/types/chat";

export const chat = {
  chatSend: async (
    messages: ChatMessage[],
  ): Promise<{ text?: string; tool_calls?: unknown[]; [key: string]: unknown }> => {
    return await ipcRenderer.invoke("chatSend", messages);
  },

  chatConfig: async (
    language: string,
  ): Promise<Record<string, unknown>> => {
    return await ipcRenderer.invoke("chatConfig", language);
  },
};
