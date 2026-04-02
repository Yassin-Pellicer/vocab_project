import { ipcMain } from "electron";

function coerceLanguage(value: string) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function coerceAccessToken(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export default function registerSendConfigChat() {
  ipcMain.handle("chatConfig", async (_event, rawLanguage, rawAccessToken) => {
    const language = coerceLanguage(rawLanguage);
    const accessToken = coerceAccessToken(rawAccessToken);

    if (!language) {
      throw new Error("A dictionary language is required.");
    }
    if (!accessToken) {
      throw new Error("Unauthorized: missing access token.");
    }

    const messages = [
      {
        role: "user",
        content: {
          prompt: `Generate dictionary configuration for the language: "${language}".`,
          details:
            "Return JSON only. " +
            "All labels must be in the target language's autonym, never the label language. " +
            "For articles: provide non-empty definite article for each gender × number pair.",
          context: {
            requestedLanguageLabel: language,
          },
        },
      },
    ];

    const response = await fetch("http://localhost:3000/api/chat/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${response.status}: ${text}`
      );
    }

    const payload = await response.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      throw new Error("Empty response from local API.");
    }

    return payload;
  });
}
