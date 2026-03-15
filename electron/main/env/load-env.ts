import { promises as fs } from "node:fs";
import path from "node:path";

function parseEnvFile(raw: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value) result[key] = value;
  }

  return result;
}

async function readEnvFileIfExists(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return parseEnvFile(raw);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return null;
    }
    return null;
  }
}

export async function loadEnvIfPresent() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local"),
    process.env.APP_ROOT ? path.join(process.env.APP_ROOT, ".env") : null,
    process.env.APP_ROOT ? path.join(process.env.APP_ROOT, ".env.local") : null,
  ].filter((p): p is string => Boolean(p));

  for (const filePath of candidates) {
    const parsed = await readEnvFileIfExists(filePath);
    if (!parsed) continue;
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

