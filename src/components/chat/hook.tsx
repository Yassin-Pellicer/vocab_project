import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ChatMessage, ContextType } from "@/types/chat";
import { notifyError } from "@/services/notify";
import { TranslationEntry } from "@/types/translation-entry";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { useConfigStore as useDictionaryStore } from "@/context/dictionary-context";
import { useChatStore } from "@/context/chat-context";

export function useChat({
  startingInfo,
  context,
  name,
  route,
  autoStart = true,
  autoStartKey,
}: {
  startingInfo?: TranslationEntry | string | null;
  context?: ContextType;
  name?: string | null;
  route?: string;
  autoStart?: boolean;
  autoStartKey?: string;
}) {

  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const didAutoStartRef = useRef(false);
  const autoStartKeyRef = useRef<string | undefined>(autoStartKey);
  const routeKeyRef = useRef<string | undefined>(route);
  const nameKeyRef = useRef<string | null | undefined>(name);

  type ChatContext = { description: string; elements: object };
  const [contextForChat, setContextForChat] = useState<ChatContext | undefined>(undefined);

  const chatKey = useMemo(() => {
    return (
      autoStartKey ??
      `${route ?? ""}|${name ?? ""}|${context?.type ?? "none"}`
    );
  }, [autoStartKey, route, name, context?.type]);

  const conversation = useChatStore(
    useCallback((state) => state.conversations[chatKey], [chatKey]),
  );
  const setConversation = useChatStore((state) => state.setConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const clearConversation = useChatStore((state) => state.clearConversation);

  const messages = conversation?.messages ?? [];
  const draft = conversation?.draft ?? "";

  const setMessages = useCallback(
    (next: ChatMessage[]) => updateConversation(chatKey, { messages: next }),
    [chatKey, updateConversation],
  );
  const setDraft = useCallback(
    (next: string) => updateConversation(chatKey, { draft: next }),
    [chatKey, updateConversation],
  );

  const { config } = usePreferencesStore();
  const { dictionaryMetadata } = useDictionaryStore();

  const dictMeta = name ? dictionaryMetadata?.[name] ?? null : null;

  type WordToolAction = {
    kind: "add" | "edit";
    word: TranslationEntry;
  };

  const DEFAULT_ENTRY: TranslationEntry = {
    pair: [
      {
        original: { word: "", gender: "", number: "" },
        translations: [{ word: "", gender: "", number: "" }],
        definitions: [],
      },
    ],
    dateAdded: new Date().toISOString().split("T")[0],
    type: "noun",
  };

  const normalizeWordEntry = (value: unknown): TranslationEntry | null => {
    if (!value || typeof value !== "object") return null;
    const raw = value as Partial<TranslationEntry>;
    const pairs = Array.isArray(raw.pair) && raw.pair.length > 0 ? raw.pair : null;
    if (!pairs) return null;

    const normalizedPairs = pairs.map((pair) => ({
      original: {
        word: pair.original?.word ?? "",
        gender: pair.original?.gender ?? "",
        number: pair.original?.number ?? "",
      },
      translations:
        pair.translations && pair.translations.length > 0
          ? pair.translations.map((t) => ({
              word: t.word ?? "",
              gender: t.gender ?? "",
              number: t.number ?? "",
            }))
          : [{ word: "", gender: "", number: "" }],
      definitions: Array.isArray(pair.definitions) ? pair.definitions : [],
    }));

    return {
      ...DEFAULT_ENTRY,
      ...raw,
      pair: normalizedPairs,
      dateAdded: raw.dateAdded ?? DEFAULT_ENTRY.dateAdded,
      type: raw.type ?? DEFAULT_ENTRY.type,
    } as TranslationEntry;
  };

  const getToolActions = useCallback((value: unknown): WordToolAction[] => {
    if (typeof value === "object" && value !== null) {
      const obj = value as { text?: unknown; tool_calls?: unknown };
      const calls = Array.isArray(obj.tool_calls) ? obj.tool_calls : [];
      const actions: WordToolAction[] = [];

      for (const call of calls) {
        const toolName =
          call?.name ??
          call?.tool ??
          call?.function ??
          call?.tool_name ??
          (typeof call?.tool === "object" ? call?.tool?.name : undefined);
        const args =
          call?.arguments ??
          call?.args ??
          call?.parameters ??
          call?.payload ??
          call;
        const tool =
          toolName === "add_words" || toolName === "modify_words"
            ? toolName
            : undefined;
        if (!tool || !args?.words || !Array.isArray(args.words)) continue;
        for (const rawWord of args.words) {
          const word = normalizeWordEntry(rawWord);
          if (!word) continue;
          if (tool === "modify_words" && !word.uuid) continue;
          actions.push({ kind: tool === "add_words" ? "add" : "edit", word });
        }
      }
      return actions;
    }

    return [];
  }, []);

  const getDisplayText = useCallback((value: unknown): string => {
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
      const obj = value as { text?: unknown };
      return typeof obj.text === "string" ? obj.text.trim() : "";
    }
    return "";
  }, []);

  const getWordLabel = useCallback((word: TranslationEntry) => {
    return word.pair?.[0]?.original?.word?.trim() || "word";
  }, []);

  type RenderMessage = {
    id: string;
    role: ChatMessage["role"];
    display: string;
    actions: WordToolAction[];
  };

  const renderMessages = useCallback((): RenderMessage[] => {
    return messages.map((m, idx) => {
      const display =
        m.role === "assistant" ? getDisplayText(m.content) : (
          typeof m.content === "string"
            ? m.content
            : typeof m.content === "object" && m.content !== null
              ? (m.content as { prompt?: string }).prompt ?? ""
              : ""
        );
      const actions = m.role === "assistant" ? getToolActions(m.content) : [];
      return {
        id: `${m.role}-${idx}`,
        role: m.role,
        display,
        actions,
      };
    });
  }, [messages, getDisplayText, getToolActions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation) {
      setConversation(chatKey, { messages: [], draft: "" });
    }
  }, [chatKey, conversation, setConversation]);

  useEffect(() => {
    if (routeKeyRef.current !== route || nameKeyRef.current !== name) {
      routeKeyRef.current = route;
      nameKeyRef.current = name;
      didAutoStartRef.current = false;
    }
  }, [route, name]);

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
    clearConversation(chatKey);
  };

  const send = async (content?: string) => {
    const messageContent = content?.trim() || draft.trim();
    if (!messageContent) return;


    const dictionaryContext = name
      ? {
          name,
          route,
          metadata: dictMeta,
          typeWords: dictMeta?.typeWords ?? [],
          genders: dictMeta?.genders ?? [],
          numbers: dictMeta?.numbers ?? [],
          articles: dictMeta?.articles ?? [],
        }
      : undefined;
    const combinedContext =
      dictionaryContext || contextForChat
        ? {
            ...(contextForChat ?? {}),
            ...(dictionaryContext ? { dictionary: dictionaryContext } : {}),
          }
        : undefined;

    const structuredMessage: ChatMessage = {
      role: "user",
      content: {
        prompt: messageContent,
        details: "",
        context: combinedContext,
        appLanguage: config.language!,
      },
    };

    const nextMessages: ChatMessage[] = [...messages, structuredMessage];
    const outboundMessages: ChatMessage[] = nextMessages.map((m) => {
      if (m.role !== "assistant") return m;
      if (typeof m.content === "string") return m;
      const text =
        typeof m.content === "object" && m.content !== null
          ? (m.content as { text?: string }).text ?? ""
          : "";
      return { role: "assistant", content: text };
    });

    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const result = await window.api.chatSend(outboundMessages);
      const assistantContent =
        typeof result === "object" && result !== null && "text" in result
          ? (result as { text?: string })
          : result;

      setMessages([...nextMessages, { role: "assistant", content: assistantContent }]);
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
      if (!autoStart) return;
      if (autoStartKeyRef.current !== autoStartKey) {
        autoStartKeyRef.current = autoStartKey;
        didAutoStartRef.current = false;
      }
      if (didAutoStartRef.current) return;
      didAutoStartRef.current = true;

      const startingPrompt: ChatMessage = {
        role: "user",
        content: {
          prompt:
            "Give a fun fact about the word of the day today.",
          details:
            "You must say: 'The word of the Day is... {word}! Here are some interesting facts about it!' and include: 1. etymology, 2. historical fact, 3. tips.",
          context: {
            startingInfo,
            dictionary: name
              ? {
                  name,
                  route,
                  metadata: dictMeta,
                  typeWords: dictMeta?.typeWords ?? [],
                  genders: dictMeta?.genders ?? [],
                  numbers: dictMeta?.numbers ?? [],
                  articles: dictMeta?.articles ?? [],
                }
              : undefined,
          },
          appLanguage: "english",
        },
      };

      const nextMessages = [...messages];
      setSending(true);

      window.api
        ?.chatSend([startingPrompt])
        .then((result) => {
          const assistantContent =
            typeof result === "object" && result !== null && "text" in result
              ? (result as { text?: string })
              : result;
          setMessages([...nextMessages, { role: "assistant", content: assistantContent }]);
        })
        .catch((err) => {
          notifyError(
            "Chatbot error",
            err instanceof Error ? err.message : String(err)
          );
        })
        .finally(() => setSending(false));
    }
  }, [startingInfo, name, route, dictionaryMetadata, autoStart, autoStartKey]);

  return {
    clearChat,
    send,
    messages,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
    contextForChat,
    setContextForChat,
    getToolActions,
    getDisplayText,
    getWordLabel,
    renderMessages,
  };
}
