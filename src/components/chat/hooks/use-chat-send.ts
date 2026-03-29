import { useCallback, useEffect, type MutableRefObject } from "react"
import { notifyError } from "@/services/notify"
import type {
  AssistantContent,
  ChatConversationScope,
  ChatMessage,
  ChatPrompContext,
} from "@/types/chat"
import type { Dictionary } from "@/types/config"
import type { TranslationEntry } from "@/types/translation-entry"
import {
  buildCombinedContext,
  buildDictionaryContext,
  buildNotesContext,
  getStartingInfoKey,
} from "@/components/chat/context-utils"
import { toOutboundMessages } from "@/components/chat/message-utils"

export const WOTD_PROMPT = "Give a fun fact about the word of the day today."
export const WOTD_DETAILS =
  "You must say: 'The Word of the Moment is... {word}! " +
  "Here are some interesting facts about it!' and include: " +
  "1. etymology, 2. historical fact, 3. tips. NEVER return a TOOL."

type UseChatSendArgs = {
  messages: ChatMessage[]
  draft: string
  setDraft: (next: string) => void
  setMessages: (next: ChatMessage[]) => void
  setSending: (next: boolean) => void
  configLanguage: string
  contextForChat?: ChatPrompContext
  name?: string | null
  dictMeta?: Dictionary | null
  selectedNoteId: string | null
  selectedNoteContent: unknown
  notesTree: unknown
  route?: string
  sessionId?: string
  startingInfo?: TranslationEntry | string | null
  autoStart?: boolean
  conversationScope?: ChatConversationScope
  runKeyRef: MutableRefObject<string>
  didAutoStartRef: MutableRefObject<boolean>
  useProvidedContext: boolean
}

const normalizeAssistantContent = (value: unknown): AssistantContent =>
  typeof value === "object" && value !== null && "text" in value
    ? (value as { text?: string })
    : (value as AssistantContent)

export const buildWotdStartingPrompt = ({
  startingInfo,
  name,
  dictMeta,
  configLanguage,
  includeContext,
}: {
  startingInfo?: TranslationEntry | string | null
  name?: string | null
  dictMeta?: Dictionary | null
  configLanguage: string
  includeContext: boolean
}): ChatMessage => ({
  role: "user",
  content: {
    prompt: WOTD_PROMPT,
    details: WOTD_DETAILS,
    context: includeContext
      ? {
          startingInfo,
          dictionary: buildDictionaryContext(name ? dictMeta : null),
        }
      : undefined,
    appLanguage: configLanguage,
  },
})

export function useChatSend({
  messages,
  draft,
  setDraft,
  setMessages,
  setSending,
  configLanguage,
  contextForChat,
  name,
  dictMeta,
  selectedNoteId,
  selectedNoteContent,
  notesTree,
  route,
  sessionId,
  startingInfo,
  autoStart = true,
  conversationScope = "assistant",
  runKeyRef,
  didAutoStartRef,
  useProvidedContext,
}: UseChatSendArgs) {
  const send = useCallback(
    async (content?: string) => {
      const messageContent = content?.trim() || draft.trim()
      if (!messageContent) return

      const combinedContext = useProvidedContext
        ? buildCombinedContext({
            selectionContext: contextForChat,
            dictionaryContext: buildDictionaryContext(name ? dictMeta : null),
            notesContext: buildNotesContext(selectedNoteId, selectedNoteContent, notesTree),
          })
        : undefined

      const structuredMessage: ChatMessage = {
        role: "user",
        content: {
          prompt: messageContent,
          details: "",
          context: combinedContext,
          appLanguage: configLanguage,
        },
      }

      const nextMessages: ChatMessage[] = [...messages, structuredMessage]
      const outboundMessages: ChatMessage[] = toOutboundMessages(nextMessages)

      setMessages(nextMessages)
      setDraft("")
      setSending(true)

      try {
        const result = await window.api.chatSend(outboundMessages)
        setMessages([
          ...nextMessages,
          { role: "assistant", content: normalizeAssistantContent(result) },
        ])
      } catch (error) {
        const message =
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: unknown }).message)
            : "Request failed."
        notifyError("Chatbot error", message)
      } finally {
        setSending(false)
      }
    },
    [
      configLanguage,
      contextForChat,
      dictMeta,
      draft,
      messages,
      name,
      notesTree,
      selectedNoteContent,
      selectedNoteId,
      setDraft,
      setMessages,
      setSending,
      useProvidedContext,
    ],
  )

  useEffect(() => {
    if (conversationScope !== "home") return
    if (!startingInfo || Object.keys(startingInfo as object).length === 0) return
    if (!autoStart) return
    if (messages.length > 0) return

    if (route || name) {
      const startingInfoKey = getStartingInfoKey(startingInfo)
      const runKey = runKeyRef.current
      const autoStartKey = `chat:wotd:home:${route ?? ""}|${name ?? ""}|${startingInfoKey}|${sessionId || "default"}|${runKey}`
      if (localStorage.getItem(autoStartKey)) return
      localStorage.setItem(autoStartKey, "1")
    }

    if (didAutoStartRef.current) return
    didAutoStartRef.current = true

    const startingPrompt = buildWotdStartingPrompt({
      startingInfo,
      name,
      dictMeta,
      configLanguage,
      includeContext: useProvidedContext,
    })

    const nextMessages = [...messages]
    setSending(true)

    window.api
      .chatSend([startingPrompt])
      .then((result) => {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: normalizeAssistantContent(result) },
        ])
      })
      .catch((error) => {
        notifyError(
          "Chatbot error",
          error instanceof Error ? error.message : String(error),
        )
      })
      .finally(() => setSending(false))
  }, [
    autoStart,
    configLanguage,
    conversationScope,
    didAutoStartRef,
    dictMeta,
    messages,
    name,
    route,
    runKeyRef,
    sessionId,
    setMessages,
    setSending,
    startingInfo,
    useProvidedContext,
  ])

  return { send }
}
