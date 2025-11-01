import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function createDictionary() {
  ipcMain.handle("createDictionary", async (_event, _route, _name) => {
    try {
      if (!fs.existsSync(_route)) {
        throw new Error(`The folder ${_route} does not exist.`);
      }

      fs.writeFileSync(
        path.join(_route, `${_name}.json`),
        JSON.stringify([], null, 2),
        "utf-8"
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error creating dictionary:", error);
      throw new Error("Failed to create dictionary.");
    }
  });
}
