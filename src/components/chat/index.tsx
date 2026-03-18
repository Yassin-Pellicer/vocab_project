import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "./hook";
import { TranslationEntry } from "@/types/translation-entry";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function Chat({ startingInfo, route, name }: { startingInfo?: TranslationEntry | string | null, route?: string, name?: string | null }) {
  const {
    clearChat,
    send,
    messages,
    draft,
    endRef,
    setDraft,
    sending,
    canSend,
  } = useChat({ startingInfo });

  return (
    <Card className="flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 sticky top-0 z-10 bg-background rounded-xl">
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

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={cn(
                "w-fit max-w-[90%] rounded-lg px-3 text-sm shadow-sm markdown",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-card text-card-foreground border"
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t p-3 sticky bottom-0 z-10 bg-background rounded-xl">
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
  );
}