import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MessageCircle, Send, Trash2, X } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { notifyError } from "@/services/notify";

const STORAGE_KEY = "chatbot-widget";

type PersistedChatState = {
  open: boolean;
  messages: ChatMessage[];
};

function loadState(): PersistedChatState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { open: false, messages: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedChatState>;
    const open = Boolean(parsed.open);
    const messages = Array.isArray(parsed.messages)
      ? (parsed.messages
          .map((m) => {
            if (typeof m !== "object" || m === null) return null;
            const role = (m as { role?: unknown }).role;
            const content = (m as { content?: unknown }).content;
            if (role !== "user" && role !== "assistant") return null;
            if (typeof content !== "string" || !content.trim()) return null;
            return { role, content: content.trim() } as ChatMessage;
          })
          .filter((m): m is ChatMessage => Boolean(m))) as ChatMessage[]
      : [];
    return { open, messages };
  } catch {
    return { open: false, messages: [] };
  }
}

function saveState(state: PersistedChatState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function ChatWidget() {
  const initial = useMemo(() => loadState(), []);
  const [open, setOpen] = useState<boolean>(initial.open);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveState({ open, messages });
  }, [open, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const canSend = !sending && draft.trim().length > 0;

  const clearChat = () => {
    setMessages([]);
    setDraft("");
  };

  const send = async () => {
    if (!canSend) return;
    if (!window.api?.chatSend) {
      notifyError("Chatbot unavailable", "IPC endpoint not available.");
      return;
    }

    const content = draft.trim();
    setDraft("");

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setSending(true);
    try {
      const result = await window.api.chatSend(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Request failed.";
      notifyError("Chatbot error", message);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <div
        style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setOpen(true)}
          className="shadow-lg"
          size="icon-lg"
          aria-label="Open assistant"
          title="Open assistant"
        >
          <MessageCircle />
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{ WebkitAppRegion: "no-drag" } as CSSProperties}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="flex h-[min(520px,calc(100vh-6rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">Assistant</div>
            <div className="text-xs text-muted-foreground">
              {sending ? "Thinking…" : "Ask anything"}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={clearChat}
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              title="Close assistant"
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3">
          {messages.length === 0 ? (
            <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
              Try: “Help me remember the difference between ‘say’ and ‘tell’.”
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={cn(
                    "max-w-[90%] rounded-lg px-3 py-2 text-sm shadow-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-card text-card-foreground border",
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t bg-card p-3">
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
          <div className="mt-2 text-xs text-muted-foreground">
            Enter to send • Shift+Enter for newline
          </div>
        </div>
      </Card>
    </div>
  );
}
