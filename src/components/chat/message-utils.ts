import type {
  ChatMessage,
  RenderMessage,
  WordToolAction,
} from "@/types/chat"
import type { TranslationEntry } from "@/types/translation-entry"

const extractToolName = (call: Record<string, unknown>): string | undefined => {
  const tool = call.tool
  if (typeof call.name === "string") return call.name
  if (typeof tool === "string") return tool
  if (typeof call.function === "string") return call.function
  if (typeof call.tool_name === "string") return call.tool_name
  if (typeof tool === "object" && tool !== null && "name" in tool) {
    const nestedName = (tool as { name?: unknown }).name
    if (typeof nestedName === "string") return nestedName
  }
  return undefined
}

const extractToolArguments = (call: Record<string, unknown>): unknown => {
  if ("arguments" in call) return call.arguments
  if ("args" in call) return call.args
  if ("parameters" in call) return call.parameters
  if ("payload" in call) return call.payload
  return call
}

export const getToolActions = (value: unknown): WordToolAction[] => {
  if (typeof value !== "object" || value === null) return []
  const obj = value as { tool_calls?: unknown }
  const calls = Array.isArray(obj.tool_calls) ? obj.tool_calls : []
  const actions: WordToolAction[] = []

  for (const rawCall of calls) {
    if (typeof rawCall !== "object" || rawCall === null) continue
    const call = rawCall as Record<string, unknown>
    const toolName = extractToolName(call)
    const tool =
      toolName === "add_words" || toolName === "modify_words"
        ? toolName
        : undefined
    if (!tool) continue

    const args = extractToolArguments(call)
    if (typeof args !== "object" || args === null) continue
    const words = (args as { words?: unknown }).words
    if (!Array.isArray(words)) continue

    for (const rawWord of words) {
      if (typeof rawWord !== "object" || rawWord === null) continue
      const word = rawWord as TranslationEntry
      if (tool === "modify_words" && !word.uuid) continue
      actions.push({ kind: tool === "add_words" ? "add" : "edit", word })
    }
  }

  return actions
}

export const getDisplayText = (value: unknown): string => {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null) {
    const text = (value as { text?: unknown }).text
    return typeof text === "string" ? text.trim() : ""
  }
  return ""
}

export const getUserDisplayText = (value: unknown): string => {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null) {
    const prompt = (value as { prompt?: unknown }).prompt
    return typeof prompt === "string" ? prompt : ""
  }
  return ""
}

export const getWordLabel = (word: TranslationEntry): string =>
  word.pair?.[0]?.original?.word?.trim() || "word"

export const renderChatMessages = (messages: ChatMessage[]): RenderMessage[] =>
  messages.map((message, index) => {
    const display =
      message.role === "assistant"
        ? getDisplayText(message.content)
        : getUserDisplayText(message.content)
    const actions = message.role === "assistant" ? getToolActions(message.content) : []
    return {
      id: `${message.role}-${index}`,
      role: message.role,
      display,
      actions,
    }
  })

export const toOutboundMessages = (messages: ChatMessage[]): ChatMessage[] =>
  messages.map((message) => {
    if (message.role !== "assistant") return message
    if (typeof message.content === "string") return message
    return {
      role: "assistant",
      content: getDisplayText(message.content),
    }
  })

