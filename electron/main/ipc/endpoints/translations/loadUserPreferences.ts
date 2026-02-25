import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { UserPreferences } from "@/types/config";
export default function loadUserPreferences() {
  ipcMain.handle("loadUserPreferences", async (_event, _config: UserPreferences) => {
    try {
      const filePath = path.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-preferences.json",
      );

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
      }

      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;

    } catch (error) {
      console.error("Error reading user preferences file:", error);
      throw new Error("Failed to load user preferences file.");
    }
  });
}
