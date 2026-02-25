import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { UserConfig } from "../../../../../src/types/config";

/**
 * Recursively removes a directory.
 */
function removeDirRecursive(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export default function deleteDictionary() {
  ipcMain.handle(
    "deleteDictionary",
    async (_event, dictId: string) => {
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

        const dictEntry = config.dictionaries[dictId];
        const dictPath = path.resolve(dictEntry.route);

        if (!fs.existsSync(dictPath) || !fs.statSync(dictPath).isDirectory()) {
          throw new Error(`Dictionary folder does not exist: ${dictPath}`);
        }

        // Remove dictionary folder
        removeDirRecursive(dictPath);

        // Remove from config
        delete config.dictionaries[dictId];
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

        return {
          success: true,
          deletedId: dictId,
          deletedPath: dictPath,
        };
      } catch (error) {
        console.error("❌ Error deleting dictionary:", error);
        throw new Error("Failed to delete dictionary.");
      }
    }
  );
}
