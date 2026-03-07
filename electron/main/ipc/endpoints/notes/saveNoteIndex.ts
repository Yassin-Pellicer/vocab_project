import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveNoteIndex() {
  ipcMain.handle(
    "saveNoteIndex",
    async (_event, _route, _name, _uuid, currentConfig) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        let filePath = path.join(normalizedRoute, `NOTES-${_name}`,`${_uuid}.md`);

        let indexFilePath = path.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `NOTES-INDEX-${_name}.md`,
        );

        const indexData = fs.readFileSync(indexFilePath, "utf-8");
        const indexJson = JSON.parse(indexData);
        Object.assign(indexJson, currentConfig);

        fs.writeFileSync(indexFilePath, JSON.stringify(indexJson, null, 2), "utf-8");

        return { success: true, path: filePath };
      } catch (error) {
        console.error("Error saving markdown file:", error);
        throw new Error(`Failed to save markdown file: ${error}`);
      }
    }
  );
}
