import { useCallback, useMemo } from "react";
import { useKeybinds } from "@/hooks/use-keybinds";

const clickIfFound = (selector: string) => {
  const el = document.querySelector<HTMLElement>(selector);
  el?.click();
};

export function useGlobalKeybinds() {
  const openSettings = useCallback(() => {
    clickIfFound('[data-config-trigger="settings"]');
  }, []);

  const toggleSidebar = useCallback(() => {
    clickIfFound('[data-sidebar="trigger"]');
  }, []);

  const actions = useMemo(
    () => ({
      Settings: () => openSettings(),
      "Toggle Sidebar": () => toggleSidebar(),
    }),
    [openSettings, toggleSidebar],
  );

  useKeybinds({ actions, allowInInput: true });
}
