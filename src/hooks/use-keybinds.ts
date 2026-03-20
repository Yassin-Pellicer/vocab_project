import { useEffect, useMemo, useRef } from "react";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import type { Keybind } from "@/types/config";

type KeybindHandler = (event: KeyboardEvent) => void;

type KeybindOptions = {
  actions: Record<string, KeybindHandler | undefined>;
  enabled?: boolean;
  allowInInput?: boolean;
  onUnhandledKeyDown?: (event: KeyboardEvent) => void;
};

const isEditableTarget = (el: Element | null) => {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable ||
    el.getAttribute("contenteditable") === "true"
  );
};

const isDialogOpen = () =>
  Boolean(document.querySelector('[role="dialog"][data-state="open"]'));

const normalizeKeyName = (value: string) => {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "cmd" || lower === "command" || lower === "meta") return "Meta";
  if (lower === "ctrl" || lower === "control") return "Control";
  if (lower === "alt" || lower === "option") return "Alt";
  if (lower === "shift") return "Shift";
  if (lower === "esc") return "Escape";
  if (trimmed.length === 1) return trimmed.toUpperCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizeEventKey = (key: string) =>
  key.length === 1 ? key.toUpperCase() : key;

const matchesKeybind = (bind: Keybind, event: KeyboardEvent) => {
  const keys = bind.keys.map(normalizeKeyName);
  const expectsCtrl = keys.includes("Control");
  const expectsAlt = keys.includes("Alt");
  const expectsShift = keys.includes("Shift");
  const expectsMeta = keys.includes("Meta");

  const nonModifiers = keys.filter(
    (k) => !["Control", "Alt", "Shift", "Meta"].includes(k),
  );
  if (nonModifiers.length === 0) return false;
  const expectedKey = nonModifiers[0];
  const actualKey = normalizeEventKey(event.key);

  if (event.ctrlKey !== expectsCtrl) return false;
  if (event.altKey !== expectsAlt) return false;
  if (event.shiftKey !== expectsShift) return false;
  if (event.metaKey !== expectsMeta) return false;

  return expectedKey === actualKey;
};

export function useKeybinds({
  actions,
  enabled = true,
  allowInInput = false,
  onUnhandledKeyDown,
}: KeybindOptions) {
  const { config } = usePreferencesStore();
  const keybinds = useMemo(() => config.keybinds ?? [], [config.keybinds]);
  const actionsRef = useRef(actions);
  const onUnhandledRef = useRef(onUnhandledKeyDown);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    onUnhandledRef.current = onUnhandledKeyDown;
  }, [onUnhandledKeyDown]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!allowInInput) {
        if (isDialogOpen()) return;
        if (isEditableTarget(document.activeElement)) return;
      }

      for (const keybind of keybinds) {
        if (!keybind.keys || keybind.keys.length === 0) continue;
        const handler = actionsRef.current[keybind.action];
        if (!handler) continue;
        if (!matchesKeybind(keybind, event)) continue;
        event.preventDefault();
        handler(event);
        return;
      }

      onUnhandledRef.current?.(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keybinds, enabled, allowInInput]);
}
