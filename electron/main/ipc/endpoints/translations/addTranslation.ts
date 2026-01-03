import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import type { TranslationEntry } from "@/types/translation-entry";

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
        const filePath = path.join(_route, `${_name}.json`);

        if (!fs.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }

        const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        let translations = Array.isArray(json) ? json : [];
        if (_word) {
          translations = translations.filter(
            (t: TranslationEntry) => t.uuid !== _word
          );
        }
        else {
          const entryUuid = entry.uuid || uuid();
          entry.uuid = entryUuid;

          const GraphfilePath = path.join(_route, `GRAPH-${_name}.json`);
          console.log("Saving graph to", GraphfilePath, "for uuid:", entry.uuid);

          let jsonGraph: Record<string, Record<string, string>> = {};

          if (fs.existsSync(GraphfilePath)) {
            jsonGraph = JSON.parse(fs.readFileSync(GraphfilePath, "utf-8"));
          }

          jsonGraph[entryUuid] = {};
          fs.writeFileSync(GraphfilePath, JSON.stringify(jsonGraph, null, 2), "utf-8");
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
        throw new Error(`Failed to add translation. ${_route}, ${error}`);
      }
    }
  );
}

