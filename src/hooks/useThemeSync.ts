import { useEffect } from "react";
import { useConfigStore } from "../context/preferences-context";

type AccentName = "blue" | "red" | "green" | "purple" | "orange" | "yellow";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

function getContrastingForeground(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Simple perceived luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#0f1724" : "#ffffff";
}

function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(37,99,235,${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function getAccentPalette(accent: string, isDark: boolean) {
  const key = (accent || "blue") as AccentName;
  const palettes: Record<
    AccentName,
    { light: { primary: string; accent: string }; dark: { primary: string; accent: string } }
  > = {
    blue: { light: { primary: "#2563eb", accent: "#60a5fa" }, dark: { primary: "#60a5fa", accent: "#60a5fa" } },
    red: { light: { primary: "#dc2626", accent: "#f87171" }, dark: { primary: "#f87171", accent: "#f87171" } },
    green: { light: { primary: "#16a34a", accent: "#4ade80" }, dark: { primary: "#4ade80", accent: "#4ade80" } },
    purple: { light: { primary: "#7c3aed", accent: "#a78bfa" }, dark: { primary: "#a78bfa", accent: "#a78bfa" } },
    orange: { light: { primary: "#ea580c", accent: "#fb923c" }, dark: { primary: "#fb923c", accent: "#fb923c" } },
    yellow: { light: { primary: "#ca8a04", accent: "#facc15" }, dark: { primary: "#facc15", accent: "#facc15" } },
  };

  const palette = palettes[key] ?? palettes.blue;
  return isDark ? palette.dark : palette.light;
}

export default function useThemeSync() {
  const appearance = useConfigStore(state => state.config.appearance || "system");
  const accentColor = useConfigStore(state => state.config.accentColor || "blue");

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

    const applyAccent = () => {
      const isDark = el.classList.contains("dark");
      const { primary, accent } = getAccentPalette(accentColor, isDark);
      const isBlue = (accentColor || "blue") === "blue";
      const primaryFg = isBlue ? "#ffffff" : getContrastingForeground(primary);
      const accentFg = isBlue ? "#ffffff" : getContrastingForeground(accent);

      el.style.setProperty("--primary", primary);
      el.style.setProperty("--primary-foreground", primaryFg);
      el.style.setProperty("--accent", accent);
      el.style.setProperty("--accent-foreground", accentFg);
      el.style.setProperty("--sidebar-primary", primary);
      el.style.setProperty("--sidebar-primary-foreground", primaryFg);
      el.style.setProperty("--sidebar-accent", accent);
      el.style.setProperty("--sidebar-accent-foreground", accentFg);
      el.style.setProperty("--chart-1", primary);

      el.style.setProperty("--ring", withAlpha(primary, isDark ? 0.4 : 0.22));
      el.style.setProperty("--sidebar-ring", withAlpha(primary, isDark ? 0.4 : 0.22));
    };

    applyTheme(appearance);
    applyAccent();

    // If 'system', listen to changes
    let mql: MediaQueryList | null = null;
    const listener = (e: MediaQueryListEvent) => {
      if (!el) return;
      if (e.matches) el.classList.add("dark");
      else el.classList.remove("dark");
      applyAccent();
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
  }, [appearance, accentColor]);
}
