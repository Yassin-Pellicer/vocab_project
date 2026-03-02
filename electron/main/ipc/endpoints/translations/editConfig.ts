import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { UserConfig } from "@/types/config";

export default function editConfig() {
  ipcMain.handle(
    "editConfig",
    async (_event, _config: UserConfig) => {
      try {
        const filePath = path.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json",
        );

        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }

        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);

        Object.assign(json, _config);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
        return json;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    },
  );
}
