import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { notifyError } from "@/services/notify";
import { TranslationEntry } from "@/types/translation-entry";

const STORAGE_KEY = "chatbot-widget";

type PersistedChatState = {
  open: boolean;
  messages: ChatMessage[];
};

export function useChat({ startingInfo }: { startingInfo?: TranslationEntry | string | null; }) {
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const saveState = (state: PersistedChatState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const canSend = !sending && draft.trim().length > 0;

  const clearChat = () => {
    setMessages([]);
    setDraft("");
  };

  const send = async (content?: string) => {
    const messageContent = content?.trim() || draft.trim();
    if (!messageContent) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: messageContent }];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const result = await window.api.chatSend(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
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
        content: "Give a fun fact about the word of the day today. " +
        "You must always answer in the language of the app (english) and you must first say"
        + "'The word of the Day is... {wordoftheday}!. Here are some interesting facts about it!'" +
        "Highlight three topics if u can 1. ethymology, 2.historical fact, 3.tips. The word is the following -> "
        + startingInfo,
      };
      const nextMessages = [...messages, startingPrompt];
      setSending(true);

      window.api
        ?.chatSend(nextMessages)
        .then((result) => {
          setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
        })
        .catch((err) => {
          notifyError("Chatbot error", err instanceof Error ? err.message : String(err));
        })
        .finally(() => setSending(false));
    }
  }, [startingInfo]);

  return {
    saveState,
    clearChat,
    send,
    messages,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
    open,
  };
}