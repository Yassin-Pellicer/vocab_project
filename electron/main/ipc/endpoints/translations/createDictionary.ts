import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route: string, _name: string) => {
      try {
        if (!fs.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }

        fs.writeFileSync(
          path.join(_route, `${_name}.json`),
          JSON.stringify([], null, 2),
          "utf-8"
        );

        const config = JSON.parse(
          fs.readFileSync(
            path.join(
              process.env.APP_ROOT || __dirname,
              "public",
              "user-config.json"
            ),
            "utf-8"
          )
        );

        config.dictionaries = config.dictionaries.filter(
          (t: { name: string; path: string }) => t.name !== _name
        );

        config.dictionaries.push({
          name: _name,
          path: _route,
        });

        fs.writeFileSync(
          path.join(
            process.env.APP_ROOT || __dirname,
            "public",
            "user-config.json"
          ),
          JSON.stringify(config, null, 2),
          "utf-8"
        );

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error creating dictionary:", error);
        throw new Error("Failed to create dictionary.");
      }
    }
  );
}
