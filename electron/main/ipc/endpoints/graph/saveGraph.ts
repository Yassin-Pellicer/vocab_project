import { ipcMain } from "electron";
import { broadcastToAllWindows } from "../../broadcast";
import {
  loadTranslationsWithGraphLinks,
  removeLegacyGraphFileIfExists,
  writeTranslations,
} from "./graph-storage";

export default function saveGraph() {
  ipcMain.handle(
    "saveGraph",
    async (_event, route, name, origin, destination) => {
      try {
        const {
          dictionaryFilePath,
          legacyGraphFilePath,
          translations,
          changed: normalizedChanged,
        } = loadTranslationsWithGraphLinks(route, name);

        const originId = origin?.uuid;
        const destinationId = destination?.uuid;

        if (!originId || !destinationId) {
          throw new Error("Both origin and destination ids are required.");
        }

        if (originId === destinationId) {
          if (normalizedChanged) {
            writeTranslations(dictionaryFilePath, translations);
          }
          removeLegacyGraphFileIfExists(legacyGraphFilePath);
          return { success: true };
        }

        const originEntry = translations.find((entry) => entry.uuid === originId);
        const destinationEntry = translations.find(
          (entry) => entry.uuid === destinationId,
        );

        if (!originEntry || !destinationEntry) {
          throw new Error("Could not find one of the requested words.");
        }

        const originLinks = new Set(originEntry.linkedWordIds ?? []);
        const destinationLinks = new Set(destinationEntry.linkedWordIds ?? []);
        const addedToOrigin = !originLinks.has(destinationId);
        const addedToDestination = !destinationLinks.has(originId);

        originLinks.add(destinationId);
        destinationLinks.add(originId);

        originEntry.linkedWordIds = Array.from(originLinks).sort();
        destinationEntry.linkedWordIds = Array.from(destinationLinks).sort();

        const changed = normalizedChanged || addedToOrigin || addedToDestination;
        if (changed) {
          writeTranslations(dictionaryFilePath, translations);
        }

        removeLegacyGraphFileIfExists(legacyGraphFilePath);

        broadcastToAllWindows("graph-changed", { route, name });
        console.log("Graph saved successfully");
        return { success: true };
      } catch (error) {
        console.error("Error saving graph:", error);
        throw new Error("Failed to save graph.");
      }
    },
  );
}
