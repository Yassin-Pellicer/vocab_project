import { useEffect } from "react";
import { PreferencesContext } from "../context/preferences-context";

type AccentName = "blue" | "red" | "green" | "purple" | "orange" | "yellow";

const palettes: Record<AccentName, { light: [string, string]; dark: [string, string] }> = {
  blue:   { light: ["#2563eb", "#ffffff"], dark: ["#60a5fa", "#ffffff"] },
  red:    { light: ["#dc2626", "#ffffff"], dark: ["#f87171", "#ffffff"] },
  green:  { light: ["#16a34a", "#ffffff"], dark: ["#4ade80", "#0f1724"] },
  purple: { light: ["#7c3aed", "#ffffff"], dark: ["#a78bfa", "#0f1724"] },
  orange: { light: ["#ea580c", "#ffffff"], dark: ["#fb923c", "#0f1724"] },
  yellow: { light: ["#ca8a04", "#0f1724"], dark: ["#facc15", "#0f1724"] },
};

function setDarkClass(el: HTMLElement, pref: string) {
  const isDark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  el.classList.toggle("dark", isDark);
}

export default function useThemeSync() {

  const appearance = PreferencesContext((s) => s.config.appearance || "system");
  const accentColor = PreferencesContext((s) => s.config.accentColor || "blue");

  useEffect(() => {
    const el = document.documentElement;

    setDarkClass(el, appearance);

    const key = (accentColor as AccentName) in palettes ? (accentColor as AccentName) : "blue";
    const isDark = el.classList.contains("dark");

    const [primary, fg] = palettes[key][isDark ? "dark" : "light"];

    el.style.setProperty("--primary", primary);
    el.style.setProperty("--primary-foreground", fg);
    el.style.setProperty("--accent", primary);
    el.style.setProperty("--accent-foreground", fg);
    el.style.setProperty("--sidebar-primary", primary);
    el.style.setProperty("--sidebar-primary-foreground", fg);
    el.style.setProperty("--sidebar-accent", primary);
    el.style.setProperty("--sidebar-accent-foreground", fg);
    el.style.setProperty("--chart-1", primary);
    el.style.setProperty("--ring", primary);
    el.style.setProperty("--sidebar-ring", primary);

    if (appearance !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setDarkClass(el, "system");

    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
    
  }, [appearance, accentColor]);
}