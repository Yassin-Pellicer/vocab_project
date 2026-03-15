import { ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { v4 as uuid } from "uuid";
import { broadcastToAllWindows } from "../../broadcast";
import { readUserConfig, writeUserConfig } from "../../../storage/user-files";

export default function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route: string, _name: string) => {
      try {
        const folderName = uuid();
        const folderPath = path.resolve(_route, folderName);
        const filePath = path.join(folderPath, `${folderName}.json`);
        const mdPath = path.join(folderPath, "MD-"+folderName);
        const notesPath = path.join(folderPath, "NOTES-"+folderName);

        if (!fs.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        fs.mkdirSync(mdPath, { recursive: true });
        fs.mkdirSync(notesPath, { recursive: true });

        const config = await readUserConfig();

        if (!config.dictionaries) {
          config.dictionaries = {};
        }

        config.dictionaries[folderName] = {
          name: _name,
          route: folderPath,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: "",
        };

        await writeUserConfig(config);

        broadcastToAllWindows("app-data-changed");
        return {
          success: true,
          folderName,
          folderPath,
        };
      } catch (error) {
        console.error("❌ Error creating dictionary:", error);
        throw new Error("Failed to create dictionary.");
      }
    }
  );
}
