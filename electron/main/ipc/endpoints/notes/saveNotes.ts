import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { broadcastToAllWindows } from "../../broadcast";

export default function saveNotes() {
  ipcMain.handle("saveNotes", async (_event, route, name, uuid, content) => {
    try {
      if (typeof route !== "string" || typeof name !== "string") {
        throw new Error("Invalid note route/name.");
      }

      if (typeof uuid !== "string" || !uuid.trim()) {
        return { success: false, error: "Invalid note id." };
      }

      const normalizedRoute = route.replace(/\\/g, "/");

      const filePath = path.join(
        normalizedRoute,
        `NOTES-${name}`,
        `${uuid}.json`
      );

      const dir = path.dirname(filePath);

      fs.mkdirSync(dir, { recursive: true });

      const safeContent =
        content && typeof content === "object"
          ? content
          : { type: "doc", content: [] };

      fs.writeFileSync(filePath, JSON.stringify(safeContent, null, 2), "utf-8");

      broadcastToAllWindows("notes-changed", {
        route: normalizedRoute,
        name,
        uuid,
      });
      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error saving markdown file:", error);
      throw new Error(`Failed to save markdown file: ${error}`);
    }
  });
}
