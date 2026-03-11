import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchNotes() {
  ipcMain.handle("fetchNotes", async (_event, _route, _name, _uuid) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `${_uuid}.json`
      );

      if (!fs.existsSync(filePath)) {
        return { type: "doc", content: [] };
      }

      const data = fs.readFileSync(filePath, "utf-8");

      try {
        return JSON.parse(data);
      } catch {
        return { type: "doc", content: [] };
      }

    } catch (error) {
      console.error("Error reading note file:", error);
      return { type: "doc", content: [] };
    }
  });
}