import { ipcMain } from "electron";
import type { ChatMessage } from "@/types/chat";

type OpenAIResponsesSuccess = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

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

function getOutputText(payload: OpenAIResponsesSuccess): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

export default function sendChat() {
  ipcMain.handle("chatSend", async (_event, rawMessages: unknown) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY. Set it in your environment (or a .env/.env.local file) before starting the app.",
      );
    }

    const messages = coerceMessages(rawMessages);
    if (messages.length === 0) {
      throw new Error("No messages provided.");
    }

    const developerPrompt =
      "You are a helpful, concise assistant inside a vocabulary app. " +
      "Answer in the user's language. Prefer short, actionable answers. " +
      "If asked for vocabulary help, include examples and brief explanations." +
      "Don't deviate from your task. Politely decline anything that isnt related with learning a language";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          { role: "developer", content: developerPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | OpenAIResponsesSuccess
      | null;

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        `OpenAI request failed with status ${response.status}.`;
      throw new Error(message);
    }

    const text = payload ? getOutputText(payload) : "";
    if (!text) throw new Error("Empty response from model.");

    return { text };
  });
}
