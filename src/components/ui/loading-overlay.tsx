import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LoadingOverlayProps = {
  loading: boolean;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  overlayClassName?: string;
};

export default function LoadingOverlay({
  loading,
  children,
  title = "Loading",
  subtitle = "",
  className,
  overlayClassName,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading ? (
        <div
          className={cn(
            "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/60 backdrop-blur-sm",
            overlayClassName,
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="rounded-full bg-muted p-4">
              <Loader2 className="text-muted-foreground animate-spin" size={24} />
            </div>
            <p className="font-semibold text-base">{title}</p>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
