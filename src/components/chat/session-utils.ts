import type { ChatConversationScope, ChatMessage, ContextType } from "@/types/chat"

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
  contextType?: ContextType["type"],
  conversationScope?: ChatConversationScope,
) => `${route ?? ""}|${name ?? ""}|${contextType ?? "none"}|${conversationScope ?? "assistant"}`

export const sessionsKey = () => "chat:sessions:global"

export const activeKey = (baseKey: string, instanceKey: string) =>
  `chat:active:${baseKey}:${instanceKey}`

export const readSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(sessionsKey())
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ChatSession[]) : []
  } catch {
    return []
  }
}

export const writeSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(sessionsKey(), JSON.stringify(sessions))
  window.dispatchEvent(new CustomEvent("chat-sessions-updated"))
}

export const readActiveSession = (baseKey: string, instanceKey: string) =>
  localStorage.getItem(activeKey(baseKey, instanceKey))

export const writeActiveSession = (baseKey: string, sessionId: string, instanceKey: string) =>
  localStorage.setItem(activeKey(baseKey, instanceKey), sessionId)

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

export const sessionChatKey = (id: string) => `session:${id}`

