import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import type { TranslationEntry } from "@/types/translation-entry";

export default function addTranslation() {
  ipcMain.handle(
    "addTranslation",
    async (
      _event,
      entry: TranslationEntry,
      _word: TranslationEntry,
      _route: string,
      _name: string
    ) => {
      try {
        const filePath = path.join(_route, `${_name}.json`);

        if (!fs.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }

        const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        let translations = Array.isArray(json) ? json : [];

        if (_word) {
          translations = translations.filter(
            (t: TranslationEntry) => t.original !== _word.original
          );
        }

        translations.push(entry);

        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );

        return { success: true };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to add translation. ${error}`);
      }
    }
  );
}
