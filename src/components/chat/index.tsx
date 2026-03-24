import {
  Lock,
  NotebookIcon,
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
import { useChat, type ChatConversationScope } from "./hook";
import { TranslationEntry } from "@/types/translation-entry";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ContextType } from "@/types/chat";
import { NotesContext } from "@/context/notes-context";
import AddWordModal from "@/components/dict/add-word-modal";
import EditWordModal from "@/components/dict/edit-word-modal";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { supabase } from "@/supabase/supabase-client";

export type ChatHandle = {
  clearChat: () => void;
};

export type ChatProps = {
  startingInfo?: TranslationEntry | string | null;
  route?: string;
  name?: string | null;
  context?: ContextType;
  autoStart?: boolean;
  /** Use `"home"` so word-of-the-day auto-start and thread are isolated from the floating assistant. */
  conversationScope?: import("./hook").ChatConversationScope;  /** Hide top toolbar (used by floating assistant shell) */
  hideToolbar?: boolean;
};

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
  const {
    clearChat,
    send,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
    contextForChat,
    getWordLabel,
    renderMessages,
  } = useChat({
    startingInfo,
    context,
    name,
    route,
    autoStart,
    conversationScope,
  });


  useImperativeHandle(ref, () => ({ clearChat }), [clearChat]);

  const { selectedNoteId, findById } = NotesContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <Card className="relative flex h-full min-h-0 flex-col border-0 shadow-none">

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

      {!hideToolbar && (
        <div className="sticky -top-1 z-10 flex items-center justify-between gap-2 rounded-xl border-b bg-background px-3 py-2">
          <div className="flex items-center gap-2 text-md font-semibold">
            <Sparkles size={16} /> Assistant
          </div>
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
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2 ">
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
                  <Sparkles size={14} />
                  <div
                    className="thinking-dots"
                    role="status"
                    aria-live="polite"
                    aria-label="Assistant is thinking"
                  >
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="wrap sticky bottom-0 z-10 rounded-xl border-t bg-background p-3">
        {contextForChat && context?.type == "word" && (
          <div className="mb-2 flex flex-row items-center justify-between gap-4">
            <p className="text-xs">
              Loaded context <br></br>with word:{" "}
            </p>
            <Button className="h-fit text-xs!">
              <WholeWord size={16} strokeWidth={1.5} />{" "}
              {(contextForChat?.elements as TranslationEntry)?.pair[0].original.word}
            </Button>
          </div>
        )}
        {selectedNoteId && contextForChat && context?.type == "note" && (
          <div className="mb-3! flex flex-col gap-2 wrap">
            <p className="text-xs">Loaded context with note: </p>
            <Button className="h-fit w-fit text-xs!">
              <NotebookIcon strokeWidth={1.5} /> {selectedNoteId && findById(selectedNoteId)?.title}
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="min-h-10 resize-none"
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
        <div className="mt-2 text-xs text-muted-foreground">Enter to send • Shift+Enter for newline</div>
      </div>
    </Card>
  );
});

Chat.displayName = "Chat";
