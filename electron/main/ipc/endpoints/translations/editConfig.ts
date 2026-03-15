import { ipcMain } from "electron";
import { UserConfig } from "@/types/config";
import { broadcastToAllWindows } from "../../broadcast";
import { readUserConfig, writeUserConfig } from "../../../storage/user-files";

export default function editConfig() {
  ipcMain.handle(
    "editConfig",
    async (_event, _config: UserConfig) => {
      try {
        const current = await readUserConfig();
        const merged: UserConfig = { ...current, ..._config };
        await writeUserConfig(merged);
        broadcastToAllWindows("app-data-changed");
        return merged;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    },
  );
}
