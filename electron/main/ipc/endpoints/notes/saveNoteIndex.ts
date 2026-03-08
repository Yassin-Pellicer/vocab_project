import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveNoteIndex() {
  ipcMain.handle(
    "saveNoteIndex",
    async (_event, _route, _name, currentConfig) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");

        let indexFilePath = path.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `NOTES-INDEX-${_name}.json`,
        );

        fs.writeFileSync(indexFilePath, JSON.stringify(currentConfig, null, 2), "utf-8");

        return { success: true, path: indexFilePath };
      } catch (error) {
        console.error("Error saving JSON file:", error);
        throw new Error(`Failed to save JSON file: ${error}`);
      }
    }
  );
}
