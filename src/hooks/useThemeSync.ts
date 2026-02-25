import { useEffect } from "react";
import { useConfigStore } from "../context/preferences-context";

export default function useThemeSync() {
  const appearance = useConfigStore(state => state.config.appearance || "system");

  useEffect(() => {
    const el = typeof document !== "undefined" ? document.documentElement : null;
    if (!el) return;

    const applyTheme = (pref: "light" | "dark" | "system") => {
      if (pref === "system") {
        const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) el.classList.add("dark");
        else el.classList.remove("dark");
      } else if (pref === "dark") {
        el.classList.add("dark");
      } else {
        el.classList.remove("dark");
      }
    };

    applyTheme(appearance);

    // If 'system', listen to changes
    let mql: MediaQueryList | null = null;
    const listener = (e: MediaQueryListEvent) => {
      if (!el) return;
      if (e.matches) el.classList.add("dark");
      else el.classList.remove("dark");
    };

    if (appearance === "system" && window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.addEventListener) mql.addEventListener("change", listener);
      else if ((mql as any).addListener) (mql as any).addListener(listener);
    }

    return () => {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener("change", listener);
        else if ((mql as any).removeListener) (mql as any).removeListener(listener);
      }
    };
  }, [appearance]);
}
