import { ipcRenderer } from "electron";
import type { ChatMessage } from "@/types/chat";

export const chat = {
  chatSend: async (
    messages: ChatMessage[],
    accessToken: string,
  ): Promise<{ text?: string; tool_calls?: unknown[]; [key: string]: unknown }> => {
    return await ipcRenderer.invoke("chatSend", messages, accessToken);
  },

  chatConfig: async (
    language: string,
    accessToken: string,
  ): Promise<Record<string, unknown>> => {
    return await ipcRenderer.invoke("chatConfig", language, accessToken);
  },
};
