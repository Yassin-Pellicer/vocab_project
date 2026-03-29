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

import { TranslationEntry } from "@/types/translation-entry"
import { PreferencesContext } from "@/context/preferences-context"
import { DictionaryContext } from "@/context/dictionary-context"
import { ChatContext } from "@/context/chat-context"
import { NotesContext } from "@/context/notes-context"
import {
  buildSelectionContext,
  getStartingInfoKey,
} from "@/components/chat/context-utils"
import {
  getDisplayText,
  getToolActions,
  getWordLabel,
  renderChatMessages,
} from "@/components/chat/message-utils"
import { useChatSend } from "@/components/chat/hooks/use-chat-send"

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
  const [useProvidedContext, setUseProvidedContext] = useState(true)
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

  const { send } = useChatSend({
    messages,
    draft,
    setDraft,
    setMessages,
    setSending,
    configLanguage: config.language!,
    contextForChat,
    name,
    dictMeta,
    selectedNoteId,
    selectedNoteContent,
    notesTree,
    route,
    sessionId,
    startingInfo,
    autoStart,
    conversationScope,
    runKeyRef,
    didAutoStartRef,
    useProvidedContext,
  })

  return {
    clearChat,
    send,
    messages,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
    useProvidedContext,
    setUseProvidedContext,
    contextForChat,
    setContextForChat,
    getToolActions,
    getDisplayText,
    getWordLabel,
    renderMessages,
    chatKey,
  }
}
