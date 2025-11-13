import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";

interface DictionaryEntry {
  name: string;
  route: string;
}

interface UserConfig {
  dictionaries?: Record<string, DictionaryEntry>;
}

export default function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route: string, _name: string) => {
      try {
        const folderName = uuid();
        const folderPath = path.resolve(_route, folderName);
        const filePath = path.join(folderPath, `${folderName}.json`);
        const mdPath = path.join(folderPath, "MD-"+folderName);

        if (!fs.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        fs.mkdirSync(mdPath, { recursive: true });

        const configPath = path.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );

        if (!fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        }

        const config: UserConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if (!config.dictionaries) {
          config.dictionaries = {};
        }

        config.dictionaries[folderName] = {
          name: _name,
          route: folderPath,
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

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
