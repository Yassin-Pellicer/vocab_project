import { ipcMain } from "electron";
import type { ChatMessage } from "@/types/chat";

function coerceMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((m) => {
      if (typeof m !== "object" || m === null) return null;
      const role = "role" in m ? (m as { role?: unknown }).role : undefined;
      const content =
        "content" in m ? (m as { content?: unknown }).content : undefined;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content !== "string") return null;
      const trimmed = content.trim();
      if (!trimmed) return null;
      return { role, content: trimmed } satisfies ChatMessage;
    })
    .filter((m): m is ChatMessage => Boolean(m));
}

export default function sendChat() {
  ipcMain.handle("chatSend", async (_event, rawMessages: unknown) => {
    const messages = coerceMessages(rawMessages);
    if (messages.length === 0) {
      throw new Error("No messages provided.");
    }

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${response.status}: ${text}`,
      );
    }

    const payload = await response.json().catch(() => null);

    return { text: payload.text };
  });
}