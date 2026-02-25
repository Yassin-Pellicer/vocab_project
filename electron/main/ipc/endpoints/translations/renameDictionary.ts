import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { UserConfig } from "../../../../../src/types/config";

export default function renameDictionary() {
  ipcMain.handle(
    "renameDictionary",
    async (_event, dictId: string, newName: string) => {
      try {
        const configPath = path.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );

        if (!fs.existsSync(configPath)) {
          throw new Error("Config file not found.");
        }

        const config: UserConfig = JSON.parse(
          fs.readFileSync(configPath, "utf-8")
        );

        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }

        if (!newName || newName.trim() === "") {
          throw new Error("Dictionary name cannot be empty.");
        }

        // Update the dictionary name in config
        config.dictionaries[dictId].name = newName.trim();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

        return {
          success: true,
          dictId,
          newName: newName.trim(),
        };
      } catch (error) {
        console.error("❌ Error renaming dictionary:", error);
        throw new Error("Failed to rename dictionary.");
      }
    }
  );
}
