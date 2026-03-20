import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ContextType } from "@/types/chat";
import { notifyError } from "@/services/notify";
import { TranslationEntry } from "@/types/translation-entry";
import { useConfigStore } from "@/context/preferences-context";

export function useChat({ startingInfo, context }: { startingInfo?: TranslationEntry | string | null; context?: ContextType }) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  type ChatContext = { description: string; elements: object };
  const [contextForChat, setContextForChat] = useState<ChatContext | undefined>(undefined);

  const { config } = useConfigStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!context) { return }
    let contextObject = { description: "", elements: {} }
    if (context.type === "word") {
      contextObject.description = "This is the word that the user has selected from their dictionary. " +
        "Do with it whatever the user asks you to."
      contextObject.elements = context.content;
      setContextForChat(contextObject);
    }
    else if (context.type === "note") {
      contextObject.description = "This is the note that the user has selected from their note folders. " +
        "Do with it whatever the user asks you to."
      contextObject.elements = context.content;
      setContextForChat(contextObject);
    }
    else { return; }
  }, [context])

  const canSend = !sending && draft.trim().length > 0;

  const clearChat = () => {
    setMessages([]);
    setDraft("");
  };

  const send = async (content?: string) => {
    const messageContent = content?.trim() || draft.trim();
    if (!messageContent) return;

    const structuredMessage: ChatMessage = {
      role: "user",
      content: {
        prompt: messageContent,
        details: "",
        context: contextForChat,
        appLanguage: config.language!,
      },
    };

    const nextMessages: ChatMessage[] = [...messages, structuredMessage];

    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const result = await window.api.chatSend(nextMessages);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.text },
      ]);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Request failed.";

      notifyError("Chatbot error", message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (startingInfo && Object.keys(startingInfo).length > 0) {
      const startingPrompt: ChatMessage = {
        role: "user",
        content: {
          prompt:
            "Give a fun fact about the word of the day today.",
          details:
            "You must say: 'The word of the Day is... {word}! Here are some interesting facts about it!' and include: 1. etymology, 2. historical fact, 3. tips.",
          context: startingInfo,
          appLanguage: "english",
        },
      };

      const nextMessages = [...messages, startingPrompt];
      setSending(true);

      window.api
        ?.chatSend(nextMessages)
        .then((result) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: result.text },
          ]);
        })
        .catch((err) => {
          notifyError(
            "Chatbot error",
            err instanceof Error ? err.message : String(err)
          );
        })
        .finally(() => setSending(false));
    }
  }, [startingInfo]);

  return {
    clearChat,
    send,
    messages,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
    open,
    contextForChat,
    setContextForChat
  };
}