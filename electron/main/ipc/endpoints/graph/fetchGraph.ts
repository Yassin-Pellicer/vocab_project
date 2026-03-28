import { ipcMain } from "electron";
import fs from "fs";
import {
  buildGraphPayload,
  getDictionaryFilePath,
  loadTranslationsWithGraphLinks,
  removeLegacyGraphFileIfExists,
  writeTranslations,
} from "./graph-storage";

export default function fetchGraph() {
  ipcMain.handle("fetchGraph", async (_event, route, name, _uuid) => {
    try {
      const dictionaryFilePath = getDictionaryFilePath(route, name);
      if (!fs.existsSync(dictionaryFilePath)) {
        return _uuid ? {} : {};
      }

      const {
        dictionaryFilePath: resolvedDictionaryPath,
        legacyGraphFilePath,
        translations,
        changed,
      } = loadTranslationsWithGraphLinks(route, name);

      if (changed) {
        writeTranslations(resolvedDictionaryPath, translations);
      }

      removeLegacyGraphFileIfExists(legacyGraphFilePath);

      const payload = buildGraphPayload(translations);
      if (_uuid) {
        return payload[_uuid] || {};
      }
      return payload;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
