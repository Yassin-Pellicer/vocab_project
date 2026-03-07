import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveNotes() {
  ipcMain.handle(
    "saveNotes",
    async (_event, _route, _name, _uuid, content, currentConfig) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        let filePath = path.join(normalizedRoute, `NOTES-${_name}`,`${_uuid}.md`);

        if (content === "") {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted markdown file at: ${filePath}`);
          }
        } else {
          fs.writeFileSync(filePath, content, "utf-8");
          console.log(`Saved markdown file at: ${filePath}`);
        }

         if (!fs.existsSync(filePath)) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }

        let indexFilePath = path.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `NOTES-INDEX-${_name}.md`,
        );

        const indexData = fs.readFileSync(indexFilePath, "utf-8");
        const indexJson = JSON.parse(indexData);
        Object.assign(indexJson, currentConfig);

        fs.writeFileSync(filePath, content, "utf-8");
        fs.writeFileSync(indexFilePath, JSON.stringify(indexJson, null, 2), "utf-8");

        return { success: true, path: filePath };
      } catch (error) {
        console.error("Error saving markdown file:", error);
        throw new Error(`Failed to save markdown file: ${error}`);
      }
    }
  );
}
