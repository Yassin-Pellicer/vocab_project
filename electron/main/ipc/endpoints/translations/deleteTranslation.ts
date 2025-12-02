import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function deleteTranslation() {
  ipcMain.handle(
    "deleteTranslation",
    async (_event, _word: string, _route: string, _name: string) => {
      try {
        const filePath = path.join(_route, `${_name}.json`);

        if (!fs.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }

        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);

        let translations = Array.isArray(json) ? json : [];

        translations = translations.filter(
          (t: any) => t.uuid !== _word
        );

        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );

        return { success: true, message: "Translation added successfully." };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to delete translation. ${error}`);
      }
    }
  );
}
