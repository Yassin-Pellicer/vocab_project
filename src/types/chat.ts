import { TranslationEntry } from "./translation-entry";

export type ChatRole = "user" | "assistant";

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
export type StructuredUserMessage = {
  role: "user";
  content: {
    prompt: string;
    details?: string;
    context?: unknown;
    appLanguage: string;
  };
};

export type ChatMessage =
  | StructuredUserMessage
  | { role: "assistant"; content: string };