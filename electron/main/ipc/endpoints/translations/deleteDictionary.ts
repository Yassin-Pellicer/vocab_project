import { ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { broadcastToAllWindows } from "../../broadcast";
import { readUserConfig, writeUserConfig } from "../../../storage/user-files";

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
        const config = await readUserConfig();

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
        await writeUserConfig(config);

        broadcastToAllWindows("app-data-changed");
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
