import {
  Archive,
  Lock,
  MessageSquare,
  NotebookIcon,
  PanelRight,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  WholeWord,
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import LoadingOverlay from "@/components/ui/loading-overlay"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TranslationEntry } from "@/types/translation-entry"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { ChatProps } from "@/types/chat"
import { NotesContext } from "@/context/notes-context"
import AddWordModal from "@/components/dict/add-word-modal"
import EditWordModal from "@/components/dict/edit-word-modal"
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import { ChatContext } from "@/context/chat-context"
import { useChat } from "./hook"
import { useAuthSession } from "@/components/chat/hooks/use-auth-session"
import { useChatSessions } from "@/components/chat/hooks/use-chat-sessions"
import {
  buildBaseKey,
  getFirstUserPrompt,
  sessionChatKey,
} from "@/components/chat/session-utils"

export type ChatHandle = {
  clearChat: () => void
}

export const Chat = forwardRef<ChatHandle, ChatProps>(function Chat(
  {
    startingInfo,
    route,
    name,
    context,
    autoStart,
    conversationScope,
    hideToolbar,
  },
  ref
) {
  const baseKey = useMemo(
    () => buildBaseKey(route, name, conversationScope),
    [route, name, conversationScope],
  )
  const conversations = ChatContext((state) => state.conversations)
  const clearConversation = ChatContext((state) => state.clearConversation)
  const {
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
  } = useChatSessions({
    baseKey,
    conversationScope,
    startingInfo,
    clearConversation,
  })

  const autoStartFlag = autoStart ?? true
  const effectiveAutoStart =
    conversationScope === "home"
      ? autoStartFlag && sessionId === wotdSessionId
      : autoStartFlag

  const { user, loading, sessionInfo, accessToken } = useAuthSession()

  const {
    clearChat,
    send,
    draft,
    setDraft,
    sending,
    canSend,
    useProvidedContext,
    setUseProvidedContext,
    contextForChat,
    getWordLabel,
    renderMessages,
    messages,
  } = useChat({
    startingInfo,
    context,
    baseKey,
    name,
    route,
    autoStart: effectiveAutoStart,
    conversationScope,
    sessionId,
    authSession: sessionInfo,
    authAccessToken: accessToken,
  })

  useImperativeHandle(
    ref,
    () => ({
      clearChat,
    }),
    [clearChat],
  )

  const { selectedNoteId, findById } = NotesContext()
  const hasSelectedContext = Boolean(contextForChat && context)

  useEffect(() => {
    if (!messages.length || !sessionId) return
    const firstUser = messages.find((message) => message.role === "user")
    const prompt = getFirstUserPrompt(firstUser)
    updateDefaultTitleFromPrompt(prompt)
  }, [messages, sessionId, updateDefaultTitleFromPrompt])

  return (
    <LoadingOverlay
      loading={loading}
      title="Loading"
      subtitle="Checking your assistant session..."
      className="h-full w-full"
      overlayClassName="rounded-xl"
    >
    <Card className="relative flex flex-row w-full h-full min-h-0 border-0">

      {!loading && !user && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="rounded-full bg-muted p-4">
              <Lock className="text-muted-foreground" size={24} />
            </div>
            <p className="font-semibold text-base">Sign in to use the Assistant</p>
            <p className="text-sm text-muted-foreground">
              You need to be logged in to access the AI assistant.
            </p>
          </div>
        </div>
      )}

      {hideToolbar && (
        <button
          type="button"
          onClick={() => setSessionsOpen((prev) => !prev)}
          aria-label="Open chat sessions"
          title="Chat sessions"
          className="absolute right-3 top-3 z-20 rounded-full border border-border/60 bg-background/90 p-2 text-muted-foreground shadow-sm transition hover:text-foreground"
        >
          <PanelRight size={16} />
        </button>
      )}

      <div className="flex flex-col min-h-0 p-4 flex-1 h-full">
        {!hideToolbar && (
          <div className="flex items-center justify-between gap-2 rounded-xl border shadow-sm mb-2 bg-background px-3 py-2">
            <div className="flex items-center gap-2 text-md font-semibold">
              <Sparkles size={16} /> Assistant
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSessionsOpen((prev) => !prev)}
                aria-label="Open chat sessions"
                title="Chat sessions"
              >
                <PanelRight />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        )}
        <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-foreground">
          <MessageSquare size={12} />
          {currentSessionTitle}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="flex flex-col gap-2">
            {renderMessages().map((m) => {
              const canUseActions = Boolean(route && name);

              return (
                <div key={m.id} className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "w-fit! max-w-[85%]!",
                      m.role === "user"
                        ? "ml-auto bg-primary/20 px-3 text-primary-background rounded-l-2xl rounded-t-2xl py-2"
                        : "mr-auto bg-card px-4 pt-2 text-card-foreground markdown"
                    )}
                  >
                    {m.role !== "user" && (
                      <div className="mb-2!">
                        <Sparkles></Sparkles>
                      </div>
                    )}
                    {m.display !== "" && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {m.display}
                      </ReactMarkdown>
                    )}
                  </div>
                  {m.actions.length > 0 && canUseActions && name && route && (
                    <div
                      className={cn(
                        "w-fit max-w-[85%]! flex flex-col gap-2 mb-6",
                        m.role === "user" ? "ml-auto" : "mr-auto"
                      )}
                    >
                      {m.actions.map((action, actionIndex) => {
                        const label = getWordLabel(action.word);
                        return action.kind === "add" ? (
                          <AddWordModal
                            key={`${m.id}-add-${actionIndex}`}
                            route={route}
                            name={name}
                            prefill={action.word}
                            trigger={
                              <Button variant="outline" size="sm">
                                + <WholeWord></WholeWord> {label}
                              </Button>
                            }
                          />
                        ) : (
                          <EditWordModal
                            key={`${m.id}-edit-${actionIndex}`}
                            route={route}
                            name={name}
                            word={action.word}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Pencil></Pencil> Edit {label}
                              </Button>
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {sending && (
              <div className="flex flex-col gap-2">
                <div className="mr-auto bg-card px-4 py-2 text-card-foreground markdown">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div
                      className="size-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary"
                      role="status"
                      aria-live="polite"
                      aria-label="Assistant is thinking"
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Thinking…
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto bg-background flex flex-col border rounded-2xl shadow-sm py-2 items-center gap-2 shrink-0">
          {hasSelectedContext && useProvidedContext && contextForChat && context?.type == "note" && (
            <div className="flex flex-row justify-between gap-4 w-full border-b pb-2.5 px-2">
              <p className="text-xs">Loaded context <br></br> with note: </p>
              <Button className="h-fit w-fit text-xs!">
                <NotebookIcon strokeWidth={1.5} /> {selectedNoteId && findById(selectedNoteId)?.title}
              </Button>
            </div>
          )}
          {hasSelectedContext && useProvidedContext && contextForChat && context?.type == "word" && (
            <div className="flex flex-row justify-between gap-4 w-full border-b pb-2.5 px-2">
              <p className="text-xs">
                Loaded context <br></br>with word:{" "}
              </p>
              <Button className="h-fit text-xs!">
                <WholeWord size={16} strokeWidth={1.5} />{" "}
                {(contextForChat?.elements as TranslationEntry)?.pair[0].original.word}
              </Button>
            </div>
          )}
          {hasSelectedContext && (
            <div className="mb-1 flex w-full items-center justify-between px-2 pt-1.5">
              <p className="text-xs text-muted-foreground">
                Use provided context
              </p>
              <Switch
                checked={useProvidedContext}
                onCheckedChange={(value) => setUseProvidedContext(Boolean(value))}
                aria-label="Toggle context usage"
              />
            </div>
          )}
          <div className="flex flex-row gap-2 w-full px-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="min-h-6 resize-none border-accent/20 overflow-auto max-h-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={sending}
            />
            <Button
              onClick={() => void send()}
              disabled={!canSend}
              size="icon"
              aria-label="Send"
              title="Send"
              className="shrink-0"
            >
              <Send />
            </Button>
          </div>
        </div>
      </div>

      {sessionsOpen && (
        <div className="absolute inset-0 flex flex-row bg-background/70 animate-in fade-in-0 duration-200">
          <div className="flex flex-col w-2/3 bg-background h-full border-r rounded-l-2xl animate-in slide-in-from-left-4 fade-in-0 duration-200 ease-out">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-semibold">
                <Archive size={14}></Archive>
                Sessions
              </p>
              <Button size="sm" className="p-2! text-xs! gap-0.5" variant="outline" onClick={handleNewSession}>
                <MessageSquare size={12}></MessageSquare> + New
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto divide-y border-t">
              {sessions.map((session) => {
                const isActive = session.id === sessionId;
                const isWotd = session.kind === "wotd";
                const key = sessionChatKey(baseKey, session.id);
                const messageCount = conversations[key]?.messages?.length ?? 0;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleSelectSession(session.id)}
                    className={cn(
                      "group w-full text-left transition",
                      isActive
                        ? "bg-primary/10 px-4 py-2"
                        : "bg-background hover:bg-primary/5 px-4 py-2 cursor-pointer"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="flex flex-row gap-1 items-center text-xs font-semibold text-foreground line-clamp-1">
                          <MessageSquare size={12}></MessageSquare>{session.title}
                        </p>
                        <p className="text-xs tracking-tight text-muted-foreground">
                          {messageCount} messages
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isWotd) {
                            handleDeleteSession(session.id);
                          }
                        }}
                        className={cn(
                          "rounded-full p-1 text-muted-foreground transition",
                          isWotd ? "opacity-0 pointer-events-none" : "opacity-0 hover:text-foreground group-hover:opacity-100"
                        )}
                        aria-label="Delete session"
                        title="Delete session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            onClick={() => setSessionsOpen((prev) => !prev)}
            className="flex-1 w-full h-full flex items-center justify-center"
          >
          </div>
        </div>
      )}
    </Card>
    </LoadingOverlay>
  );
});

Chat.displayName = "Chat";
