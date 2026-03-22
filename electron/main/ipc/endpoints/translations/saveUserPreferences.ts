import { ipcMain } from "electron";
import { UserPreferences } from "@/types/config";
import { broadcastToAllWindows } from "../../broadcast";
import {
  readUserPreferences,
  writeUserPreferences,
} from "../../../storage/user-files";

export default function saveUserPreferences() {
  ipcMain.handle(
    "saveUserPreferences",
    async (_event, _config: UserPreferences) => {
      try {
        const current = await readUserPreferences();
        const merged: UserPreferences = { ...current, ..._config };
        console.log(_config)
        await writeUserPreferences(merged);
        broadcastToAllWindows("app-data-changed");
        return merged;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    },
  );
}
