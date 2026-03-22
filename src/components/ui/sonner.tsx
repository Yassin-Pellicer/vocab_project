import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { PreferencesContext } from "@/context/preferences-context"

const Toaster = ({ ...props }: ToasterProps) => {

  const appearance = PreferencesContext((s) => s.config.appearance || "system");

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  })

  useEffect(() => {
    if (typeof document === "undefined") return;

    let mql: MediaQueryList | null = null;
    const el = document.documentElement;

    const sync = () => setIsDark(el.classList.contains("dark")); sync();

    const obs = new MutationObserver(sync)
    obs.observe(el, { attributes: true, attributeFilter: ["class"] })

    const onSystemChange = () => sync();
    
    if (appearance === "system" && window.matchMedia) {
      mql = window.matchMedia("(prefers-color-scheme: dark)")
      if (mql.addEventListener) mql.addEventListener("change", onSystemChange)
      else {
        const legacy = mql as unknown as {
          addListener?: (listener: (e: MediaQueryListEvent) => void) => void
        }
        legacy.addListener?.(onSystemChange)
      }
    }

    return () => {
      obs.disconnect()
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener("change", onSystemChange)
        else {
          const legacy = mql as unknown as {
            removeListener?: (listener: (e: MediaQueryListEvent) => void) => void
          }
          legacy.removeListener?.(onSystemChange)
        }
      }
    }
  }, [appearance])

  return (
    <Sonner
      theme={(isDark ? "dark" : "light") as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
