import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { broadcastToAllWindows } from "../../broadcast";
import type { TranslationEntry } from "@/types/translation-entry";

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

        const translations: TranslationEntry[] = Array.isArray(json) ? (json as TranslationEntry[]) : [];
        const nextTranslations = translations.filter((t) => t.uuid !== _word);

        {
          const filePath = path.join(_route, `GRAPH-${_name}.json`);
          console.log(
            "Deleting graph entry from",
            filePath,
            "for uuid:",
            _word
          );

          let json: Record<string, Record<string, string>> = {};

          if (fs.existsSync(filePath)) {
            json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          }

          if (json[_word]) {
            delete json[_word];
          }

          for (const [sourceId, targets] of Object.entries(json)) {
            if (targets && typeof targets === "object" && _word in targets) {
              delete targets[_word];
            }
            if (targets && typeof targets === "object" && Object.keys(targets).length === 0) {
              delete json[sourceId];
            }
          }

          fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
          console.log("Graph entry deleted successfully");
          broadcastToAllWindows("graph-changed", { route: _route, name: _name });
        }

        fs.writeFileSync(
          filePath,
          JSON.stringify(nextTranslations, null, 2),
          "utf-8"
        );

        broadcastToAllWindows("app-data-changed");
        return { success: true, message: "Translation added successfully." };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to delete translation. ${error}`);
      }
    }
  );
}
