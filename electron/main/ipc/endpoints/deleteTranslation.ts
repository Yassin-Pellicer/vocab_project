import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import type { TranslationEntry } from "@/types/translation-entry";

export default function deleteTranslation() {
  ipcMain.handle(
    "deleteTranslation",
    async (_event, _word) => {
      try {
        const filePath = path.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "german.json"
        );

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        }

        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);

        let translations = Array.isArray(json) ? json : [];

        translations = translations.filter(
          (t: TranslationEntry) => t.original !== _word.original
        );

        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );

        return { success: true, message: "Translation added successfully." };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error("Failed to add translation.");
      }
    }
  );
}
