import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveNotes() {
  ipcMain.handle("saveNotes", async (_event, route, name, uuid, content) => {
    try {
      const normalizedRoute = route.replace(/\\/g, "/");

      const filePath = path.join(
        normalizedRoute,
        `NOTES-${name}`,
        `${uuid}.json`
      );

      const dir = path.dirname(filePath);

      if (content === null) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return { success: true };
      }

      fs.mkdirSync(dir, { recursive: true });

      if (content === undefined) {
        fs.writeFileSync(filePath, "", "utf-8");
      } else {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
      }

      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error saving markdown file:", error);
      throw new Error(`Failed to save markdown file: ${error}`);
    }
  });
}