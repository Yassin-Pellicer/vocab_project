import { ipcMain, dialog } from "electron";

export default function selectFolder() {
  ipcMain.handle("selectFolder", async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled) {
        return null; 
      }

      return result.filePaths[0];
    } catch (error) {
      console.error("Error selecting folder:", error);
      throw new Error("Failed to select folder.");
    }
  });
}
