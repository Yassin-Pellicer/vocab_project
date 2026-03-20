import { NotebookIcon, Pencil, Send, Sparkles, Trash2, User, WholeWord } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "./hook";
import { TranslationEntry } from "@/types/translation-entry";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ContextType } from "@/types/chat";
import { useNotesStore } from "@/context/notes-context";
import AddWordModal from "@/components/dict/add-word-modal";
import EditWordModal from "@/components/dict/edit-word-modal";

export function Chat({
  startingInfo,
  route,
  name,
  context,
  autoStart,
  autoStartKey,
}: {
  startingInfo?: TranslationEntry | string | null;
  route?: string;
  name?: string | null;
  context?: ContextType;
  autoStart?: boolean;
  autoStartKey?: string;
}) {
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
  } = useChat({ startingInfo, context, name, route, autoStart, autoStartKey });

  const { selectedNoteId, findById } = useNotesStore();

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

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
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
                  {m.role !== "user" && <div className="pb-4!"><Sparkles></Sparkles></div>}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {m.display}
                    </ReactMarkdown>
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
                              + <WholeWord></WholeWord> Add {label}
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

      <div className="border-t p-3 sticky bottom-0 z-10 bg-background rounded-xl">
        {contextForChat && context?.type == "word" && <div className="flex flex-row mb-2 items-center justify-between gap-4">
          <p className="text-xs">Loaded context <br></br>with word: </p>
          <Button className="h-fit">
            <WholeWord size={16} strokeWidth={1.5} /> {(contextForChat?.elements as TranslationEntry)?.pair[0].original.word}
          </Button>
        </div>}
        {selectedNoteId && contextForChat && context?.type == "note" && <div className="flex flex-row mb-2 items-center justify-between gap-4">
          <p className="text-xs">Loaded context <br></br> with note: </p>
          <Button className="h-fit">
            <NotebookIcon strokeWidth={1.5} /> {selectedNoteId && findById(selectedNoteId)?.title}
          </Button>
        </div>}
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
