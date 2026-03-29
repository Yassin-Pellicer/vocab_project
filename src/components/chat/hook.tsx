import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react"

import type { 
  ChatPrompContext, 
  ChatMessage, 
  ContextType, 
  ChatConversationScope,
  RenderMessage,
} from "@/types/chat"

import { notifyError } from "@/services/notify"
import { TranslationEntry } from "@/types/translation-entry"
import { PreferencesContext } from "@/context/preferences-context"
import { DictionaryContext } from "@/context/dictionary-context"
import { ChatContext } from "@/context/chat-context"
import { NotesContext } from "@/context/notes-context"
import {
  buildCombinedContext,
  buildDictionaryContext,
  buildNotesContext,
  buildSelectionContext,
  getStartingInfoKey,
} from "@/components/chat/context-utils"
import {
  getDisplayText,
  getToolActions,
  getWordLabel,
  renderChatMessages,
  toOutboundMessages,
} from "@/components/chat/message-utils"

const EMPTY_MESSAGES: ChatMessage[] = []

export function useChat({
  startingInfo,
  context,
  name,
  route,
  autoStart = true,
  conversationScope = "assistant",
  sessionId = "default",
}: {
  startingInfo?: TranslationEntry | string | null;
  context?: ContextType;
  name?: string | null;
  route?: string;
  autoStart?: boolean;
  conversationScope?: ChatConversationScope;
  sessionId?: string;
}) {
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const didAutoStartRef = useRef(false)
  const routeKeyRef = useRef<string | undefined>(route)
  const nameKeyRef = useRef<string | null | undefined>(name)
  const scopeKeyRef = useRef<ChatConversationScope>(conversationScope)
  const sessionKeyRef = useRef<string>(sessionId)
  const runKeyRef = useRef<string>("")

  if (!runKeyRef.current) {
    if (typeof sessionStorage === "undefined") {
      runKeyRef.current = "default"
    } else {
      const keyName = "chat:run"
      const existing = sessionStorage.getItem(keyName)
      if (existing) {
        runKeyRef.current = existing
      } else {
        const next =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `run-${Date.now()}-${Math.random().toString(16).slice(2)}`
        sessionStorage.setItem(keyName, next)
        runKeyRef.current = next
      }
    }
  }
  const startingInfoKeyRef = useRef<string>(
    getStartingInfoKey(startingInfo),
  )
  
  const setConversation = ChatContext((state) => state.setConversation)
  const updateConversation = ChatContext((state) => state.updateConversation)
  const clearConversation = ChatContext((state) => state.clearConversation)

  const [contextForChat, setContextForChat] = useState<ChatPrompContext | undefined>(undefined)

  const chatKey = useMemo(() => {
    const key = sessionId || "default"
    return `session:${key}`
  }, [sessionId])

  const conversation = ChatContext(
    useCallback((state) => state.conversations[chatKey], [chatKey]),
  )

  const messages = conversation?.messages ?? EMPTY_MESSAGES
  const draft = conversation?.draft ?? ""

  const setMessages = useCallback(
    (next: ChatMessage[]) => updateConversation(chatKey, { messages: next }),
    [chatKey, updateConversation],
  )

  const setDraft = useCallback(
    (next: string) => updateConversation(chatKey, { draft: next }),
    [chatKey, updateConversation],
  )

  const { config } = PreferencesContext()
  const { dictionaryMetadata } = DictionaryContext()
  const selectedNoteId = NotesContext((state) => state.selectedNoteId)
  const selectedNoteContent = NotesContext((state) => state.selectedNoteContent)
  const notesTree = NotesContext((state) => state.tree)

  const dictMeta = name ? dictionaryMetadata?.[name] ?? null : null

  const renderMessages = useCallback((): RenderMessage[] => {
    return renderChatMessages(messages)
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!conversation) {
      setConversation(chatKey, { messages: [], draft: "" })
    }
  }, [chatKey, conversation, setConversation])

  useEffect(() => {
    const startingInfoKey = getStartingInfoKey(startingInfo)
    if (
      routeKeyRef.current !== route ||
      nameKeyRef.current !== name ||
      scopeKeyRef.current !== conversationScope ||
      sessionKeyRef.current !== sessionId ||
      startingInfoKeyRef.current !== startingInfoKey
    ) {
      routeKeyRef.current = route;
      nameKeyRef.current = name;
      scopeKeyRef.current = conversationScope;
      sessionKeyRef.current = sessionId;
      startingInfoKeyRef.current = startingInfoKey;
      didAutoStartRef.current = false;
    }
  }, [route, name, conversationScope, sessionId, startingInfo]);

  useEffect(() => {
    setContextForChat(buildSelectionContext(context))
  }, [context])

  const canSend = !sending && draft.trim().length > 0

  const clearChat = () => {
    clearConversation(chatKey)
  }

  const send = async (content?: string) => {
    const messageContent = content?.trim() || draft.trim()
    if (!messageContent) return

    const dictionaryContext = buildDictionaryContext(name ? dictMeta : null)
    const notesContext = buildNotesContext(selectedNoteId, selectedNoteContent, notesTree)
    const combinedContext = buildCombinedContext({
      selectionContext: contextForChat,
      dictionaryContext,
      notesContext,
    })

    const structuredMessage: ChatMessage = {
      role: "user",
      content: {
        prompt: messageContent,
        details: "",
        context: combinedContext,
        appLanguage: config.language!,
      },
    }

    const nextMessages: ChatMessage[] = [...messages, structuredMessage]
    const outboundMessages: ChatMessage[] = toOutboundMessages(nextMessages)

    setMessages(nextMessages)
    setDraft("")
    setSending(true)

    try {
      const result = await window.api.chatSend(outboundMessages)
      const assistantContent =
        typeof result === "object" && result !== null && "text" in result
          ? (result as { text?: string })
          : result

      setMessages([...nextMessages, { role: "assistant", content: assistantContent }])
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Request failed."

      notifyError("Chatbot error", message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (conversationScope !== "home") return
    if (startingInfo && Object.keys(startingInfo as object).length > 0) {
      if (!autoStart) return
      if (messages.length > 0 && conversationScope !== "home") return
      if (route || name) {
        const startingInfoKey = getStartingInfoKey(startingInfo)
        const runKey = runKeyRef.current
        const autoStartKey = `chat:wotd:home:${route ?? ""}|${name ?? ""}|${startingInfoKey}|${sessionId || "default"}|${runKey}`
        if (localStorage.getItem(autoStartKey)) return
        localStorage.setItem(autoStartKey, "1")
      }
      if (didAutoStartRef.current) return
      didAutoStartRef.current = true

      const startingPrompt: ChatMessage = {
        role: "user",
        content: {
          prompt:
            "Give a fun fact about the word of the day today.",
          details:
            "You must say: 'The Word of the Moment is... {word}! " +
            "Here are some interesting facts about it!' and include: " +
            "1. etymology, 2. historical fact, 3. tips. NEVER return a TOOL.",
          context: {
            startingInfo,
            dictionary: buildDictionaryContext(name ? dictMeta : null),
          },
          appLanguage: config.language!,
        },
      }

      const nextMessages = [...messages]
      setSending(true)

      window.api
        ?.chatSend([startingPrompt])
        .then((result) => {
          const assistantContent =
            typeof result === "object" && result !== null && "text" in result
              ? (result as { text?: string })
              : result
          setMessages([...nextMessages, { role: "assistant", content: assistantContent }])
        })
        .catch((err) => {
          notifyError(
            "Chatbot error",
            err instanceof Error ? err.message : String(err),
          )
        })
        .finally(() => setSending(false))
    }
  }, [
    autoStart,
    config.language,
    conversationScope,
    dictMeta,
    messages,
    name,
    route,
    sessionId,
    setMessages,
    startingInfo,
  ])

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
    chatKey,
  }
}
