import { PRESET_KEYBINDS } from "@/types/config";
import { useState, useEffect, useRef, useCallback } from "react";

export function useAddKeybindModal({ open, onAdd, index, onClose }: {
  open: boolean;
  onAdd: (keybind: any) => void;
  index: number;
  onClose: () => void;
}) {
  const [customKeys, setCustomKeys] = useState<string>("");
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setCustomKeys("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "BUTTON" || (e.target as HTMLElement)?.tagName === "INPUT") return;
      e.preventDefault();
      const keys = [];
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (e.metaKey) keys.push("Meta");
      if (
        e.key !== "Control" &&
        e.key !== "Shift" &&
        e.key !== "Alt" &&
        e.key !== "Meta"
      ) {
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
        setCustomKeys(keys.join("+"));
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  const handleAdd = useCallback(() => {
    if (index === null || !customKeys.trim()) return;
    onAdd({ action: PRESET_KEYBINDS[index].action, keys: customKeys.split("+").map((k: string) => k.trim()) });
    reset();
    onClose();
  }, [index, customKeys, onAdd, PRESET_KEYBINDS, reset, onClose]);

  return {
    customKeys,
    setCustomKeys,
    reset,
    dialogContentRef,
    handleAdd,
  };
}
