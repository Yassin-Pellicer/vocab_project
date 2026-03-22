import { TranslationEntry } from "./translation-entry";

export type ChatRole = "user" | "assistant";

export type ChatToolCall = {
  name?: string;
  arguments?: unknown;
  [key: string]: unknown;
};

export type AssistantContent =
  | string
  | {
      text?: string;
      tool_calls?: ChatToolCall[];
      [key: string]: unknown;
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
  content: TranslationEntry | object;
};
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
  | { role: "assistant"; content: AssistantContent };

export type ChatPrompContext = { description: string; elements: object };

export type WordToolAction = {
  kind: "add" | "edit";
  word: TranslationEntry;
};

export type Conversation = {
  messages: ChatMessage[];
  draft: string;
};
