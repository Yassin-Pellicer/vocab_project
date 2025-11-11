import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchMarkdown() {
  ipcMain.handle("fetchMarkdown", async (_event, _route, _name) => {
    try {
      const filePath = path.join(_route, `${_name}.md`);
      const data = fs.readFileSync(filePath, "utf-8");

      return data;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error("Failed to load markdown file.");
    }
  });
}
