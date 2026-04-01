import { ipcMain } from "electron";

function getEnvValue(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getDeleteEndpoint() {
  return (
    getEnvValue("DELETE_ACCOUNT_ENDPOINT") ??
    "http://localhost:3000/api/delete-account"
  );
}

export default function deleteAccount() {
  ipcMain.handle("deleteAccount", async (_event, rawAccessToken: unknown) => {
    if (typeof rawAccessToken !== "string" || rawAccessToken.trim().length === 0) {
      throw new Error("Missing Supabase access token.");
    }

    try {
      const accessToken = rawAccessToken.trim();
      const endpoint = getDeleteEndpoint();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Delete account endpoint failed with status ${response.status}${text ? `: ${text}` : ""}`,
        );
      }

      const payload = await response.json().catch(() => null);
      if (
        payload &&
        typeof payload === "object" &&
        "success" in payload &&
        (payload as { success?: unknown }).success === false
      ) {
        const message =
          "message" in payload && typeof (payload as { message?: unknown }).message === "string"
            ? (payload as { message: string }).message
            : "Delete account endpoint returned success=false.";
        throw new Error(message);
      }

      return payload && typeof payload === "object"
        ? payload
        : { success: true as const };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account.";
      console.error("❌ Error deleting account via backend endpoint:", message);
      throw new Error(message);
    }
  });
}
