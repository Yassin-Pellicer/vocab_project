import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveMarkdown() {
  ipcMain.handle("saveMarkdown", async (_event, _route, _name, markdown) => {
    try {
      const filePath = path.join(_route, `${_name}.md`);
      fs.writeFileSync(filePath, markdown);
    } catch (error) {
      console.error("Error saving markdown file:", error);
      throw new Error("Failed to save markdown file.");
    }
  });
}

