import { toast } from "sonner";
import { NOTIFICATIONS, type NotificationKey, type NotificationPayloads } from "@/notifications/registry";
import { getNotificationSettings } from "@/services/notification-settings";

type ToastFn = (title: string, opts?: { id?: string; description?: string; duration?: number }) => string | number;

const toastByKind: Record<"success" | "info" | "warning" | "error" | "message", ToastFn> = {
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
  error: toast.error,
  message: toast,
};

const lastFiredAt = new Map<string, number>();

export const notify = <K extends NotificationKey>(key: K, payload: NotificationPayloads[K]) => {
  const { enabled, durationMs } = getNotificationSettings();
  if (!enabled) return;

  const template = NOTIFICATIONS[key];
  const id = template.id?.(payload) ?? key;
  const now = Date.now();

  if (template.cooldownMs && template.cooldownMs > 0) {
    const last = lastFiredAt.get(id);
    if (typeof last === "number" && now - last < template.cooldownMs) return;
    lastFiredAt.set(id, now);
  }

  const title = template.title(payload);
  const description = template.description?.(payload);

  return toastByKind[template.kind](title, {
    id,
    description,
    duration: durationMs,
  });
};

export const notifyError = (title: string, description?: string) => {
  const { enabled, durationMs } = getNotificationSettings();
  if (!enabled) return;
  return toast.error(title, { description, duration: durationMs });
};
