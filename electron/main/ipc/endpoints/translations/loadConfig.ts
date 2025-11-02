import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function loadConfig() {
  ipcMain.handle("loadConfig", async (_event) => {
    try {
      const filePath = path.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
      );

      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);

      return json;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
