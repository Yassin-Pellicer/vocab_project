import { ipcMain } from "electron";
import { broadcastToAllWindows } from "../../broadcast";
import { readUserConfig, writeUserConfig } from "../../../storage/user-files";

export default function renameDictionary() {
  ipcMain.handle(
    "renameDictionary",
    async (_event, dictId: string, newName: string) => {
      try {
        const config = await readUserConfig();

        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }

        if (!newName || newName.trim() === "") {
          throw new Error("Dictionary name cannot be empty.");
        }

        // Update the dictionary name in config
        config.dictionaries[dictId].name = newName.trim();
        await writeUserConfig(config);

        broadcastToAllWindows("app-data-changed");
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
