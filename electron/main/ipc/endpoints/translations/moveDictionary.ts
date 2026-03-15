import { ipcMain } from "electron";
import path from "node:path";
import { promises as fs } from "node:fs";
import { broadcastToAllWindows } from "../../broadcast";
import { readUserConfig, writeUserConfig } from "../../../storage/user-files";

async function copyDirRecursive(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const removeDirRecursive = (dir: string) =>
  fs.rm(dir, { recursive: true, force: true });

export default function moveDictionary() {
  ipcMain.handle(
    "moveDictionary",
    async (_event, dictId: string, newRoute: string) => {
      try {
        const config = await readUserConfig();

        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }

        const dictEntry = config.dictionaries[dictId];
        const oldRouteRaw = dictEntry.route;

        const srcDir = path.resolve(oldRouteRaw);
        const destParent = path.resolve(newRoute);

        const srcStats = await fs.stat(srcDir).catch(() => null);
        if (!srcStats?.isDirectory()) {
          throw new Error(`Source folder does not exist or is not a directory: ${srcDir}`);
        }

        const destStats = await fs.stat(destParent).catch(() => null);
        if (!destStats?.isDirectory()) {
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

        if (await fs.stat(newFolderPath).catch(() => null)) {
          throw new Error(
            `A folder named "${folderName}" already exists at the destination (${newFolderPath}).`
          );
        }

        let moved = false;
        try {
          await fs.rename(srcDir, newFolderPath);
          moved = true;
        } catch (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string }).code === "EXDEV"
          ) {
            await copyDirRecursive(srcDir, newFolderPath);
            await removeDirRecursive(srcDir);
            moved = true;
          } else {
            throw error;
          }
        }

        if (!moved) {
          throw new Error('Failed to move dictionary folder for unknown reasons.');
        }

        config.dictionaries[dictId].route = newFolderPath;
        await writeUserConfig(config);

        broadcastToAllWindows("app-data-changed");
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
