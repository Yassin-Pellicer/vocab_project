import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { broadcastToAllWindows } from "../../broadcast";
import {
  loadTranslationsWithGraphLinks,
  normalizeTranslationGraphLinks,
  removeLegacyGraphFileIfExists,
  writeTranslations,
} from "../graph/graph-storage";

export default function deleteTranslation() {
  ipcMain.handle(
    "deleteTranslation",
    async (_event, _word: string, _route: string, _name: string) => {
      try {
        const dictionaryFilePath = path.join(_route, `${_name}.json`);
        if (!fs.existsSync(dictionaryFilePath)) {
          throw new Error(`The file ${dictionaryFilePath} does not exist.`);
        }

        const {
          dictionaryFilePath: resolvedDictionaryFilePath,
          legacyGraphFilePath,
          translations,
          changed: normalizedChanged,
        } = loadTranslationsWithGraphLinks(_route, _name);

        let nextTranslations = translations.filter((t) => t.uuid !== _word);
        let changed = normalizedChanged || nextTranslations.length !== translations.length;

        nextTranslations = nextTranslations.map((entry) => {
          if (!entry.linkedWordIds?.includes(_word)) return entry;
          changed = true;
          return {
            ...entry,
            linkedWordIds: entry.linkedWordIds.filter((id) => id !== _word),
          };
        });

        if (normalizeTranslationGraphLinks(nextTranslations)) {
          changed = true;
        }

        if (changed) {
          writeTranslations(resolvedDictionaryFilePath, nextTranslations);
        }

        removeLegacyGraphFileIfExists(legacyGraphFilePath);

        broadcastToAllWindows("graph-changed", {
          route: _route,
          name: _name,
        });

        broadcastToAllWindows("app-data-changed");
        return { success: true, message: "Translation deleted successfully." };
      } catch (error) {
        console.error("Error deleting translation:", error);
        throw new Error(`Failed to delete translation. ${error}`);
      }
    },
  );
}
