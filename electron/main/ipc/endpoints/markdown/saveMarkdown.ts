import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveMarkdown() {
  ipcMain.handle(
    "saveMarkdown",
    async (_event, _route, _name, _uuid, content) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        const filePath = path.join(
          normalizedRoute,
          `MD-${_name}`,
          `${_uuid}.json`,
        );

        const dir = path.dirname(filePath);

        const isEmptyDoc =
          content &&
          content.type === "doc" &&
          Array.isArray(content.content) &&
          content.content.length === 1 &&
          content.content[0].type === "paragraph" &&
          content.content[0].attrs?.textAlign === null &&
          !content.content[0].content;

        if (content === null || isEmptyDoc) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return { success: true };
        }

        fs.mkdirSync(dir, { recursive: true });

        if (content === undefined) {
          fs.writeFileSync(filePath, "", "utf-8");
        } else {
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
        }

        return { success: true, path: filePath };
      } catch (error) {
        console.error("Error saving markdown file:", error);
        throw new Error(`Failed to save markdown file: ${error}`);
      }
    },
  );
}