import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChatConversationScope } from "@/types/chat"
import type { TranslationEntry } from "@/types/translation-entry"
import {
  createSession,
  DEFAULT_SESSION_TITLE,
  readActiveSession,
  readSessions,
  sessionChatKey,
  sessionsKey,
  WOTD_SESSION_TITLE,
  writeActiveSession,
  writeSessions,
} from "@/components/chat/session-utils"

type UseChatSessionsArgs = {
  baseKey: string
  conversationScope?: ChatConversationScope
  startingInfo?: TranslationEntry | string | null
  clearConversation: (key: string) => void
}

export function useChatSessions({
  baseKey,
  conversationScope,
  startingInfo,
  clearConversation,
}: UseChatSessionsArgs) {
  const instanceKey = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
    return `instance-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }, [])

  const [sessions, setSessions] = useState<ReturnType<typeof readSessions>>([])
  const [sessionId, setSessionId] = useState("")
  const [sessionsOpen, setSessionsOpen] = useState(false)

  const wotdSessionId = useMemo(
    () => sessions.find((session) => session.kind === "wotd")?.id ?? "",
    [sessions],
  )
  const currentSession = useMemo(
    () => sessions.find((session) => session.id === sessionId),
    [sessions, sessionId],
  )
  const currentSessionTitle = currentSession?.title ?? DEFAULT_SESSION_TITLE

  useEffect(() => {
    const storedSessions = readSessions()
    let nextSessions = storedSessions
    if (storedSessions.length === 0) {
      const initial = createSession()
      nextSessions = [initial]
      writeSessions(nextSessions)
    }

    const active = readActiveSession(baseKey, instanceKey)
    const activeId =
      nextSessions.find((session) => session.id === active)?.id ??
      nextSessions[0]?.id ??
      ""

    setSessions(nextSessions)
    setSessionId(activeId)
    if (activeId) {
      writeActiveSession(baseKey, activeId, instanceKey)
    }
  }, [baseKey, instanceKey])

  useEffect(() => {
    if (conversationScope !== "home") return
    if (!startingInfo) return
    if (!sessions.length) return
    if (sessions.some((session) => session.kind === "wotd")) return

    const wotdSession = createSession({
      title: WOTD_SESSION_TITLE,
      kind: "wotd",
    })
    const nextSessions = [wotdSession, ...sessions]
    setSessions(nextSessions)
    writeSessions(nextSessions)
    setSessionId(wotdSession.id)
    writeActiveSession(baseKey, wotdSession.id, instanceKey)
  }, [conversationScope, startingInfo, sessions, baseKey, instanceKey])

  useEffect(() => {
    if (conversationScope !== "home") return
    if (!startingInfo) return
    if (!wotdSessionId) return
    if (typeof sessionStorage === "undefined") return

    const bootKey = `chat:wotd:boot:${baseKey}`
    if (sessionStorage.getItem(bootKey)) return
    sessionStorage.setItem(bootKey, "1")

    clearConversation(sessionChatKey(wotdSessionId))
    setSessionId(wotdSessionId)
    writeActiveSession(baseKey, wotdSessionId, instanceKey)
  }, [conversationScope, startingInfo, wotdSessionId, baseKey, instanceKey, clearConversation])

  useEffect(() => {
    const syncSessions = () => {
      const latest = readSessions()
      if (latest.length === 0) return
      setSessions(latest)
      if (!latest.find((session) => session.id === sessionId)) {
        const fallback = latest[0]?.id ?? ""
        setSessionId(fallback)
        if (fallback) {
          writeActiveSession(baseKey, fallback, instanceKey)
        }
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== sessionsKey()) return
      syncSessions()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("chat-sessions-updated", syncSessions as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("chat-sessions-updated", syncSessions as EventListener)
    }
  }, [baseKey, instanceKey, sessionId])

  useEffect(() => {
    if (!sessionId) return
    writeActiveSession(baseKey, sessionId, instanceKey)
  }, [baseKey, sessionId, instanceKey])

  const handleNewSession = useCallback(() => {
    const nextSession = createSession()
    setSessions((prev) => {
      const next = [nextSession, ...prev]
      writeSessions(next)
      return next
    })
    setSessionId(nextSession.id)
    writeActiveSession(baseKey, nextSession.id, instanceKey)
    setSessionsOpen(true)
  }, [baseKey, instanceKey])

  const handleSelectSession = useCallback(
    (id: string) => {
      setSessionId(id)
      writeActiveSession(baseKey, id, instanceKey)
      setSessionsOpen(false)
    },
    [baseKey, instanceKey],
  )

  const handleDeleteSession = useCallback(
    (id: string) => {
      const target = sessions.find((session) => session.id === id)
      if (target?.kind === "wotd") return

      setSessions((prev) => {
        const next = prev.filter((session) => session.id !== id)
        const fallback = next[0] ?? createSession()
        if (next.length === 0) {
          next.push(fallback)
        }
        writeSessions(next)
        const nextActive = id === sessionId ? fallback.id : sessionId
        setSessionId(nextActive)
        writeActiveSession(baseKey, nextActive, instanceKey)
        return next
      })
      clearConversation(sessionChatKey(id))
    },
    [baseKey, clearConversation, instanceKey, sessionId, sessions],
  )

  const updateDefaultTitleFromPrompt = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim()
      if (!trimmed || !sessionId) return

      setSessions((prev) => {
        let changed = false
        const next = prev.map((session) => {
          if (session.id !== sessionId) return session
          if (session.kind === "wotd") return session
          if (session.title !== DEFAULT_SESSION_TITLE) return session
          changed = true
          return {
            ...session,
            title: trimmed.slice(0, 40),
            updatedAt: Date.now(),
          }
        })
        if (!changed) return prev
        writeSessions(next)
        return next
      })
    },
    [sessionId],
  )

  return {
    sessions,
    sessionId,
    sessionsOpen,
    setSessionsOpen,
    wotdSessionId,
    currentSessionTitle,
    handleNewSession,
    handleSelectSession,
    handleDeleteSession,
    updateDefaultTitleFromPrompt,
  }
}

