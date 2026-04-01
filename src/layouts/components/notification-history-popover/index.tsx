import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  MessageCircle,
  Trash2,
  BellOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  NotificationHistoryContext,
  type NotificationHistoryEntry,
  type NotificationHistoryKind,
} from "@/context/notification-history-context";

function kindIcon(kind: NotificationHistoryKind) {
  const common = "size-4 shrink-0";
  switch (kind) {
    case "success":
      return <CheckCircle2 className={cn(common, "text-emerald-600 dark:text-emerald-400")} />;
    case "info":
      return <Info className={cn(common, "text-sky-600 dark:text-sky-400")} />;
    case "warning":
      return <AlertTriangle className={cn(common, "text-amber-600 dark:text-amber-400")} />;
    case "error":
      return <AlertCircle className={cn(common, "text-red-600 dark:text-red-400")} />;
    default:
      return <MessageCircle className={cn(common, "text-muted-foreground")} />;
  }
}

function formatRelativeTime(at: number): string {
  const diff = Date.now() - at;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function HistoryRow({
  entry,
  onRemove,
}: {
  entry: NotificationHistoryEntry;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-1 py-2 text-sm leading-snug border-b border-border last:border-b-0">
      <div className="pt-0.5 shrink-0 mr-2">{kindIcon(entry.kind)}</div>
      <div className="min-w-0 flex-1 space-y-0.5 pr-1">
        <p className="font-medium text-foreground wrap-break-word">{entry.title}</p>
        {entry.description ? (
          <p className="text-muted-foreground text-xs wrap-break-word">{entry.description}</p>
        ) : null}
        <p className="text-muted-foreground text-[11px]">{formatRelativeTime(entry.at)}</p>
      </div>
      <button
        className="flex items-center justify-center size-5 shrink-0 text-foreground hover:bg-destructive! rounded-full hover:text-background/90!"
        aria-label="Remove notification"
        title="Remove"
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </button> 
    </li>
  );
}

export function NotificationHistoryPopover() {
  
  const [open, setOpen] = useState(false);
  const entries = NotificationHistoryContext((s) => s.entries);
  const lastReadAt = NotificationHistoryContext((s) => s.lastReadAt);
  const clear = NotificationHistoryContext((s) => s.clear);
  const removeEntry = NotificationHistoryContext((s) => s.removeEntry);

  const unreadCount = useMemo(
    () => entries.filter((e) => e.at > lastReadAt).length,
    [entries, lastReadAt]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative rounded cursor-pointer hover:bg-transparent! hover:text-foreground! mt-0.5 mr-0.5"
          aria-label="Notification history"
        >
          <Bell size={24} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] z-50 p-0 flex flex-col max-h-[min(24rem,70vh)]"
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2 shrink-0">
          <span className="text-sm font-medium">Notifications</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            disabled={entries.length === 0}
            onClick={() => clear()}
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground px-3 py-6 text-center border-t flex items-center justify-center gap-2">
            <BellOff size={16}></BellOff> No notifications yet.
          </p>
        ) : (
          <>
            <Separator />
            <ul className="overflow-y-auto px-3 py-1 flex-1 min-h-0">
              {entries.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  onRemove={() => removeEntry(entry.id)}
                />
              ))}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
