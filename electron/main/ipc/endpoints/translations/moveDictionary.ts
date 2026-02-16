import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

interface DictionaryEntry {
  name: string;
  route: string;
}

interface UserConfig {
  dictionaries?: Record<string, DictionaryEntry>;
}

/**
 * Recursively copies a directory from src to dest.
 */
function copyDirRecursive(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Recursively removes a directory.
 */
function removeDirRecursive(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export default function moveDictionary() {
  ipcMain.handle(
    "moveDictionary",
    async (_event, dictId: string, newRoute: string) => {
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
        const oldRoute = dictEntry.route;

        if (!fs.existsSync(oldRoute)) {
          throw new Error(`Source folder does not exist: ${oldRoute}`);
        }

        if (!fs.existsSync(newRoute)) {
          throw new Error(`Destination folder does not exist: ${newRoute}`);
        }

        // The dictionary folder name is the dictId (uuid)
        const folderName = path.basename(oldRoute);
        const newFolderPath = path.join(newRoute, folderName);

        if (fs.existsSync(newFolderPath)) {
          throw new Error(
            `A folder named "${folderName}" already exists at the destination.`
          );
        }

        // Copy entire dictionary folder to new location
        copyDirRecursive(oldRoute, newFolderPath);

        // Remove old folder
        removeDirRecursive(oldRoute);

        // Update config with new route
        config.dictionaries[dictId].route = newFolderPath;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

        return {
          success: true,
          oldRoute,
          newRoute: newFolderPath,
        };
      } catch (error) {
        console.error("❌ Error moving dictionary:", error);
        throw new Error("Failed to move dictionary.");
      }
    }
  );
}
