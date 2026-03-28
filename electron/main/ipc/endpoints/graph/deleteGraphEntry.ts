import { ipcMain } from "electron";
import { broadcastToAllWindows } from "../../broadcast";
import {
  loadTranslationsWithGraphLinks,
  removeLegacyGraphFileIfExists,
  writeTranslations,
} from "./graph-storage";

export default function deleteGraphEntry() {
  ipcMain.handle(
    "deleteGraphEntry",
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

        const originEntry = translations.find((entry) => entry.uuid === originId);
        const destinationEntry = translations.find(
          (entry) => entry.uuid === destinationId,
        );

        let changed = normalizedChanged;

        if (originEntry?.linkedWordIds?.includes(destinationId)) {
          originEntry.linkedWordIds = originEntry.linkedWordIds.filter(
            (id) => id !== destinationId,
          );
          changed = true;
        }

        if (destinationEntry?.linkedWordIds?.includes(originId)) {
          destinationEntry.linkedWordIds = destinationEntry.linkedWordIds.filter(
            (id) => id !== originId,
          );
          changed = true;
        }

        if (changed) {
          writeTranslations(dictionaryFilePath, translations);
        }

        removeLegacyGraphFileIfExists(legacyGraphFilePath);

        broadcastToAllWindows("graph-changed", { route, name });
        console.log("Graph entry deleted successfully");
        return { success: true };
      } catch (error) {
        console.error("Error deleting graph entry:", error);
        throw new Error("Failed to delete graph entry.");
      }
    },
  );
}
