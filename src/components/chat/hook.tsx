import { 
  useEffect, 
  useRef, 
  useState, 
  useCallback,
  useMemo 
} from "react";

import type { ChatPrompContext, ChatMessage, ContextType, WordToolAction } from "@/types/chat";
import { notifyError } from "@/services/notify";
import { TranslationEntry } from "@/types/translation-entry";
import { PreferencesContext } from "@/context/preferences-context";
import { DictionaryContext } from "@/context/dictionary-context";
import { ChatContext } from "@/context/chat-context";

export function useChat({
  startingInfo,
  context,
  name,
  route,
  autoStart = true,
}: {
  startingInfo?: TranslationEntry | string | null;
  context?: ContextType;
  name?: string | null;
  route?: string;
  autoStart?: boolean;
}) {

  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const didAutoStartRef = useRef(false);
  const routeKeyRef = useRef<string | undefined>(route);
  const nameKeyRef = useRef<string | null | undefined>(name);
  
  const setConversation = ChatContext((state) => state.setConversation);
  const updateConversation = ChatContext((state) => state.updateConversation);
  const clearConversation = ChatContext((state) => state.clearConversation);

  const [contextForChat, setContextForChat] = useState<ChatPrompContext | undefined>(undefined);

  const chatKey = useMemo(() => {
    return (
      `${route ?? ""}|${name ?? ""}|${context?.type ?? "none"}`
    );
  }, [route, name, context?.type]);


  const conversation = ChatContext(
    useCallback((state) => state.conversations[chatKey], [chatKey]),
  );

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

  const { config } = PreferencesContext();
  const { dictionaryMetadata } = DictionaryContext();

  const dictMeta = name ? dictionaryMetadata?.[name] ?? null : null;

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
          const word = rawWord;
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
          language: dictMeta?.name,
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
      if (didAutoStartRef.current) return;
      didAutoStartRef.current = true;

      const startingPrompt: ChatMessage = {
        role: "user",
        content: {
          prompt:
            "Give a fun fact about the word of the day today.",
          details:
            "You must say: 'The Word of the Moment is... {word}! Here are some interesting facts about it!' and include: 1. etymology, 2. historical fact, 3. tips. NEVER return a TOOL.",
          context: {
            startingInfo,
            dictionary: name
              ? {
                  language: dictMeta?.name,
                  typeWords: dictMeta?.typeWords ?? [],
                  genders: dictMeta?.genders ?? [],
                  numbers: dictMeta?.numbers ?? [],
                  articles: dictMeta?.articles ?? [],
                }
              : undefined,
          },
          appLanguage: config.language!,
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
  }, [startingInfo, name, route, dictionaryMetadata, autoStart]);

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
