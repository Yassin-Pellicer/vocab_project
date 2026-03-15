import { ipcMain } from "electron";
import { readUserPreferences } from "../../../storage/user-files";

export default function loadUserPreferences() {
  ipcMain.handle("loadUserPreferences", async () => {
    try {
      return await readUserPreferences();
    } catch (error) {
      console.error("Error reading user preferences file:", error);
      throw new Error("Failed to load user preferences file.");
    }
  });
}
