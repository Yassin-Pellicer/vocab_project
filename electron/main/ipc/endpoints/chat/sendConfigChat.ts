import { ipcMain } from "electron";

function coerceLanguage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export default function sendConfigChat() {
  ipcMain.handle("chatConfig", async (_event, rawLanguage: unknown) => {
    const language = coerceLanguage(rawLanguage);

    if (!language) {
      throw new Error("A dictionary language is required.");
    }

    const messages = [
      {
        role: "user",
        content: {
          prompt: `Generate dictionary configuration for language "${language}".`,
          details:
            "Return JSON only. Do not include route or name fields in the final config.",
          context: { targetLanguage: language },
          appLanguage: language,
        },
      },
    ];

    const response = await fetch("http://localhost:3000/api/chat/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        targetLanguage: language,
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${response.status}: ${text}`,
      );
    }

    const payload = await response.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      throw new Error("Empty response from local API.");
    }

    return payload;
  });
}
