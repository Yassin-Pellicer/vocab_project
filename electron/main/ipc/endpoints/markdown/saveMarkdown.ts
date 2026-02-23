import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveMarkdown() {
  ipcMain.handle(
    "saveMarkdown",
    async (_event, _route, _name, _uuid, markdown) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        const filePath = path.join(normalizedRoute, `MD-${_name}`,`${_uuid}.md`);

        if (markdown === "") {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted markdown file at: ${filePath}`);
          }
        } else {
          fs.writeFileSync(filePath, markdown, "utf-8");
          console.log(`Saved markdown file at: ${filePath}`);
        }

        return { success: true, path: filePath };
      } catch (error) {
        console.error("Error saving markdown file:", error);
        throw new Error(`Failed to save markdown file: ${error}`);
      }
    }
  );
}
