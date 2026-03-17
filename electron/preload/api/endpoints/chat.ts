import { ipcRenderer } from "electron";
import type { ChatMessage } from "@/types/chat";

export const chat = {
  chatSend: async (messages: ChatMessage[]): Promise<{ text: string }> => {
    return await ipcRenderer.invoke("chatSend", messages);
  },
};

