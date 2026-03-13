import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function loadTranslations() {
  ipcMain.handle("loadTranslations", async (_event, _route, _name) => {
    try {
      const filePath = path.join(_route, `${_name}.json`);

      if (!fs.existsSync(filePath)) {
        return [];
      }

      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data || "[]");

      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.error("Error reading JSON file:", error);
      return [];
    }
  });
}
