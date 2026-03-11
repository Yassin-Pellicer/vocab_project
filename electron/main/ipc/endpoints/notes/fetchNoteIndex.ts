import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchNoteIndex() {
  ipcMain.handle("fetchNoteIndex", async (_event, _route, _name) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `NOTES-INDEX-${_name}.json`,
      );

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
      }

      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error(`Failed to load markdown file: ${error}`);
    }
  });
}
