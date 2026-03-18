import { TranslationEntry } from "./translation-entry";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type OpenAIResponsesSuccess = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

export type ContextType = {
  type: "word" | "note";
  content: TranslationEntry | object
}