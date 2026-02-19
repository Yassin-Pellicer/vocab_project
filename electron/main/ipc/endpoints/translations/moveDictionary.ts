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
        const oldRouteRaw = dictEntry.route;

        const srcDir = path.resolve(oldRouteRaw);
        const destParent = path.resolve(newRoute);

        if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
          throw new Error(`Source folder does not exist or is not a directory: ${srcDir}`);
        }

        if (!fs.existsSync(destParent) || !fs.statSync(destParent).isDirectory()) {
          throw new Error(`Destination folder does not exist or is not a directory: ${destParent}`);
        }

        const folderName = path.basename(srcDir);
        const newFolderPath = path.join(destParent, folderName);

        const isSubPath = (parent: string, child: string) => {
          const relative = path.relative(parent, child);
          return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        };

        if (srcDir === newFolderPath) {
          // Nothing to do
          return { success: true, oldRoute: srcDir, newRoute: newFolderPath };
        }

        if (isSubPath(srcDir, newFolderPath)) {
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        }

        if (fs.existsSync(newFolderPath)) {
          throw new Error(
            `A folder named "${folderName}" already exists at the destination (${newFolderPath}).`
          );
        }

        let moved = false;
        try {
          fs.renameSync(srcDir, newFolderPath);
          moved = true;
        } catch (err: any) {
          if (err && err.code === 'EXDEV') {
            copyDirRecursive(srcDir, newFolderPath);
            removeDirRecursive(srcDir);
            moved = true;
          } else {
            throw err;
          }
        }

        if (!moved) {
          throw new Error('Failed to move dictionary folder for unknown reasons.');
        }

        config.dictionaries[dictId].route = newFolderPath;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

        return {
          success: true,
          oldRoute: srcDir,
          newRoute: newFolderPath,
        };
      } catch (error) {
        console.error("❌ Error moving dictionary:", error);
        throw new Error("Failed to move dictionary.");
      }
    }
  );
}
