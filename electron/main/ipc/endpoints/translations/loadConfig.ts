import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function loadConfig() {
  ipcMain.handle("loadConfig", async () => {
    try {
      const filePath = path.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
      );

      // create parent directory if missing
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // create file with empty object if missing
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        return {};
      }

      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);

      return json;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
