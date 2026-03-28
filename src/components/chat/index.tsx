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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TranslationEntry } from "@/types/translation-entry";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ContextType, ChatMessage, ChatProps, ChatConversationScope } from "@/types/chat";
import { NotesContext } from "@/context/notes-context";
import AddWordModal from "@/components/dict/add-word-modal";
import EditWordModal from "@/components/dict/edit-word-modal";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { supabase } from "@/supabase/supabase-client";
import { ChatContext } from "@/context/chat-context";
import { useChat } from "./hook";

type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  kind?: "wotd";
};

const DEFAULT_SESSION_TITLE = "New chat";
const WOTD_SESSION_TITLE = "Word of the Day";

const buildBaseKey = (
  route?: string,
  name?: string | null,
  contextType?: ContextType["type"],
  conversationScope?: ChatConversationScope,
) => `${route ?? ""}|${name ?? ""}|${contextType ?? "none"}|${conversationScope ?? "assistant"}`;

const sessionsKey = () => "chat:sessions:global";
const activeKey = (baseKey: string, instanceKey: string) =>
  `chat:active:${baseKey}:${instanceKey}`;

const readSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(sessionsKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatSession[]) : [];
  } catch {
    return [];
  }
};

const writeSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(sessionsKey(), JSON.stringify(sessions));
  window.dispatchEvent(new CustomEvent("chat-sessions-updated"));
};

const readActiveSession = (baseKey: string, instanceKey: string) =>
  localStorage.getItem(activeKey(baseKey, instanceKey));
const writeActiveSession = (baseKey: string, sessionId: string, instanceKey: string) =>
  localStorage.setItem(activeKey(baseKey, instanceKey), sessionId);

const createSession = (overrides?: Partial<ChatSession>): ChatSession => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: DEFAULT_SESSION_TITLE,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

const getFirstUserPrompt = (message: ChatMessage | undefined): string => {
  if (!message || message.role !== "user") return "";
  const content = message.content;
  if (typeof content === "string") return content;
  if (typeof content === "object" && content !== null) {
    return (content as { prompt?: string }).prompt ?? "";
  }
  return "";
};

const sessionChatKey = (id: string) => `session:${id}`;

export type ChatHandle = {

};

export const Chat = forwardRef<() => void, ChatProps>(function Chat(
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
  const instanceKeyRef = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `instance-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const baseKey = useMemo(
    () => buildBaseKey(route, name, context?.type, conversationScope),
    [route, name, context?.type, conversationScope],
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const conversations = ChatContext((state) => state.conversations);
  const clearConversation = ChatContext((state) => state.clearConversation);

  const wotdSessionId = useMemo(
    () => sessions.find((session) => session.kind === "wotd")?.id ?? "",
    [sessions],
  );
  const currentSession = useMemo(
    () => sessions.find((session) => session.id === sessionId),
    [sessions, sessionId],
  );
  const currentSessionTitle = currentSession?.title ?? DEFAULT_SESSION_TITLE;
  const autoStartFlag = autoStart ?? true;
  const effectiveAutoStart =
    conversationScope === "home"
      ? autoStartFlag && sessionId === wotdSessionId
      : autoStartFlag;

  const {
    clearChat,
    send,
    draft,
    setDraft,
    sending,
    canSend,
    contextForChat,
    getWordLabel,
    renderMessages,
    messages,
  } = useChat({
    startingInfo,
    context,
    name,
    route,
    autoStart: effectiveAutoStart,
    conversationScope,
    sessionId,
  });


  useImperativeHandle(ref, () => (clearChat), [clearChat]);

  const { selectedNoteId, findById } = NotesContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSessions = readSessions();
    let nextSessions = storedSessions;
    if (storedSessions.length === 0) {
      const initial = createSession();
      nextSessions = [initial];
      writeSessions(nextSessions);
    }
    const active = readActiveSession(baseKey, instanceKeyRef);
    const activeId =
      nextSessions.find((session) => session.id === active)?.id ??
      nextSessions[0]?.id ??
      "";

    setSessions(nextSessions);
    setSessionId(activeId);
    if (activeId) {
      writeActiveSession(baseKey, activeId, instanceKeyRef);
    }
  }, [baseKey]);

  useEffect(() => {
    if (conversationScope !== "home") return;
    if (!startingInfo) return;
    if (!sessions.length) return;
    if (sessions.some((session) => session.kind === "wotd")) return;

    const wotdSession = createSession({
      title: WOTD_SESSION_TITLE,
      kind: "wotd",
    });
    const nextSessions = [wotdSession, ...sessions];
    setSessions(nextSessions);
    writeSessions(nextSessions);
    setSessionId(wotdSession.id);
    writeActiveSession(baseKey, wotdSession.id, instanceKeyRef);
  }, [conversationScope, startingInfo, sessions, baseKey]);

  useEffect(() => {
    if (conversationScope !== "home") return;
    if (!startingInfo) return;
    if (!wotdSessionId) return;
    if (typeof sessionStorage === "undefined") return;

    const bootKey = `chat:wotd:boot:${baseKey}`;
    if (sessionStorage.getItem(bootKey)) return;
    sessionStorage.setItem(bootKey, "1");

    clearConversation(sessionChatKey(wotdSessionId));
    setSessionId(wotdSessionId);
    writeActiveSession(baseKey, wotdSessionId, instanceKeyRef);
  }, [conversationScope, startingInfo, wotdSessionId, baseKey]);

  useEffect(() => {
    const syncSessions = () => {
      const latest = readSessions();
      if (latest.length === 0) return;
      setSessions(latest);
      if (!latest.find((session) => session.id === sessionId)) {
        const fallback = latest[0]?.id ?? "";
        setSessionId(fallback);
        if (fallback) {
          writeActiveSession(baseKey, fallback, instanceKeyRef);
        }
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== sessionsKey()) return;
      syncSessions();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("chat-sessions-updated", syncSessions as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("chat-sessions-updated", syncSessions as EventListener);
    };
  }, [baseKey, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    writeActiveSession(baseKey, sessionId, instanceKeyRef);
  }, [baseKey, sessionId, instanceKeyRef]);

  useEffect(() => {
    if (!messages.length || !sessionId) return;
    const currentSession = sessions.find((session) => session.id === sessionId);
    if (currentSession?.kind === "wotd") return;
    const firstUser = messages.find((m) => m.role === "user");
    const prompt = getFirstUserPrompt(firstUser).trim();
    if (!prompt) return;
    setSessions((prev) => {
      const next = prev.map((session) => {
        if (session.id !== sessionId) return session;
        const title =
          session.title === DEFAULT_SESSION_TITLE ? prompt.slice(0, 40) : session.title;
        return { ...session, title, updatedAt: Date.now() };
      });
      writeSessions(next);
      return next;
    });
  }, [baseKey, messages, sessionId, sessions]);

  const handleNewSession = () => {
    const nextSession = createSession();
    setSessions((prev) => {
      const next = [nextSession, ...prev];
      writeSessions(next);
      return next;
    });
    setSessionId(nextSession.id);
    writeActiveSession(baseKey, nextSession.id, instanceKeyRef);
    setSessionsOpen(true);
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    writeActiveSession(baseKey, id, instanceKeyRef);
    setSessionsOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    const target = sessions.find((session) => session.id === id);
    if (target?.kind === "wotd") return;
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== id);
      const fallback = next[0] ?? createSession();
      if (next.length === 0) {
        next.push(fallback);
      }
      writeSessions(next);
      const nextActive = id === sessionId ? fallback.id : sessionId;
      setSessionId(nextActive);
      writeActiveSession(baseKey, nextActive, instanceKeyRef);
      return next;
    });
    clearConversation(sessionChatKey(id));
  };

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
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
                        : "mr-auto bg-card px-4 py-2 text-card-foreground markdown"
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
                        "w-fit max-w-[85%]! flex flex-col gap-2",
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

        <div className="mt-auto bg-background flex flex-col border rounded-2xl shadow-sm p-2 items-center gap-2 shrink-0">
          {contextForChat && context?.type == "note" && (
            <div className="mb-2 flex flex-row justify-between gap-4 w-full">
              <p className="text-xs">Loaded context <br></br> with note: </p>
              <Button className="h-fit w-fit text-xs!">
                <NotebookIcon strokeWidth={1.5} /> {selectedNoteId && findById(selectedNoteId)?.title}
              </Button>
            </div>
          )}
          {contextForChat && context?.type == "word" && (
            <div className="mb-2 flex flex-row justify-between gap-4 w-full">
              <p className="text-xs">
                Loaded context <br></br>with word:{" "}
              </p>
              <Button className="h-fit text-xs!">
                <WholeWord size={16} strokeWidth={1.5} />{" "}
                {(contextForChat?.elements as TranslationEntry)?.pair[0].original.word}
              </Button>
            </div>
          )}
          <div className="flex flex-row gap-2 w-full">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="min-h-6 resize-none"
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
              const key = sessionChatKey(session.id);
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
  );
});

Chat.displayName = "Chat";
