import { ipcMain } from "electron";
import { readUserConfig } from "../../../storage/user-files";

export default function loadConfig() {
  ipcMain.handle("loadConfig", async () => {
    try {
      return await readUserConfig();
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
