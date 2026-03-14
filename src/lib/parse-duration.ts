export type ParseDurationOptions = {
  defaultUnit?: "ms" | "s";
  /**
   * If a numeric string has no unit, treat values >= this as milliseconds,
   * otherwise treat as seconds.
   */
  unitlessMsThreshold?: number;
};

export const parseDurationMs = (
  value: unknown,
  {
    defaultUnit = "s",
    unitlessMsThreshold = 1000,
  }: ParseDurationOptions = {},
): number | undefined => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return undefined;
    return defaultUnit === "ms" ? Math.round(value) : Math.round(value * 1000);
  }

  if (typeof value !== "string") return undefined;
  const raw = value.trim().toLowerCase();
  if (!raw) return undefined;

  if (raw.endsWith("ms")) {
    const n = Number(raw.slice(0, -2));
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return Math.round(n);
  }

  if (raw.endsWith("s")) {
    const n = Number(raw.slice(0, -1));
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return Math.round(n * 1000);
  }

  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;

  if (n >= unitlessMsThreshold) return Math.round(n);
  return defaultUnit === "ms" ? Math.round(n) : Math.round(n * 1000);
};

