import { ipcMain } from "electron";
import fs from "fs";
import { v4 as uuid } from "uuid";
import type { TranslationEntry } from "@/types/translation-entry";
import { broadcastToAllWindows } from "../../broadcast";
import {
  loadTranslationsWithGraphLinks,
  normalizeTranslationGraphLinks,
  removeLegacyGraphFileIfExists,
  writeTranslations,
} from "../graph/graph-storage";

export default function addTranslation() {
  ipcMain.handle(
    "addTranslation",
    async (
      _event,
      entry: TranslationEntry,
      _word: string,
      _route: string,
      _name: string
    ) => {
      try {
        const {
          dictionaryFilePath,
          legacyGraphFilePath,
          translations: loadedTranslations,
          changed: normalizedChanged,
        } = loadTranslationsWithGraphLinks(_route, _name);

        let translations = [...loadedTranslations];
        let changed = normalizedChanged;

        if (_word) {
          const existingEntry = translations.find(
            (current: TranslationEntry) => current.uuid === _word,
          );
          translations = translations.filter(
            (t: TranslationEntry) => t.uuid !== _word
          );
          entry.linkedWordIds = existingEntry?.linkedWordIds
            ? [...existingEntry.linkedWordIds]
            : [];
        } else {
          const entryUuid = entry.uuid || uuid();
          entry.uuid = entryUuid;
          if (!Array.isArray(entry.linkedWordIds)) {
            entry.linkedWordIds = [];
          }
        }

        if (entry.uuid) {
          const uniqueLinks = Array.from(
            new Set(
              (entry.linkedWordIds ?? []).filter(
                (targetId): targetId is string =>
                  typeof targetId === "string" && targetId !== entry.uuid,
              ),
            ),
          ).sort();
          entry.linkedWordIds = uniqueLinks;
        }

        translations.push(entry);

        const graphChanged = normalizeTranslationGraphLinks(translations);
        changed = changed || graphChanged;

        writeTranslations(dictionaryFilePath, translations);
        if (changed || fs.existsSync(legacyGraphFilePath)) {
          removeLegacyGraphFileIfExists(legacyGraphFilePath);
        }

        broadcastToAllWindows("app-data-changed");
        return { success: true };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to add translation. ${_route}, ${error}`);
      }
    }
  );
}
