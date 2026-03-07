import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchNotes() {
  ipcMain.handle("fetchNotes", async (_event, _route, _name, _uuid) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path.join(normalizedRoute, `NOTES-${_name}`, `${_uuid}.json`);

      if (!fs.existsSync(filePath)) {
        return ""; 
      }

      const data = fs.readFileSync(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error(`Failed to load markdown file: ${error}`);
    }
  });
}