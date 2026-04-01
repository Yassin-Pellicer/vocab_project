import type { ChatConversationScope, ChatMessage } from "@/types/chat"

export type ChatSession = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  kind?: "wotd"
}

export const DEFAULT_SESSION_TITLE = "New chat"
export const WOTD_SESSION_TITLE = "Word of the Day"

export const buildBaseKey = (
  route?: string,
  name?: string | null,
  conversationScope?: ChatConversationScope,
) => `${route ?? ""}|${name ?? ""}|${conversationScope ?? "assistant"}`

const normalizeBaseKey = (baseKey: string) => encodeURIComponent(baseKey)

export const sessionsKey = (baseKey: string) => `chat:sessions:${normalizeBaseKey(baseKey)}`

export const activeKey = (baseKey: string) =>
  `chat:active:${normalizeBaseKey(baseKey)}`

export const readSessions = (baseKey: string): ChatSession[] => {
  try {
    const raw = localStorage.getItem(sessionsKey(baseKey))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ChatSession[]) : []
  } catch {
    return []
  }
}

export const writeSessions = (baseKey: string, sessions: ChatSession[]) => {
  localStorage.setItem(sessionsKey(baseKey), JSON.stringify(sessions))
  window.dispatchEvent(new CustomEvent("chat-sessions-updated"))
}

export const readActiveSession = (baseKey: string) =>
  localStorage.getItem(activeKey(baseKey))

export const writeActiveSession = (baseKey: string, sessionId: string) =>
  localStorage.setItem(activeKey(baseKey), sessionId)

export const createSession = (overrides?: Partial<ChatSession>): ChatSession => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: DEFAULT_SESSION_TITLE,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

export const getFirstUserPrompt = (message: ChatMessage | undefined): string => {
  if (!message || message.role !== "user") return ""
  const content = message.content
  if (typeof content === "string") return content
  if (typeof content === "object" && content !== null) {
    return (content as { prompt?: string }).prompt ?? ""
  }
  return ""
}

export const sessionChatKey = (baseKey: string, id: string) =>
  `session:${normalizeBaseKey(baseKey)}:${id}`
