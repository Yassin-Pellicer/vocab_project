import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchGraph() {
  ipcMain.handle("fetchGraph", async (_event, route, name, _uuid) => {
    try {
      const filePath = path.join(route, `GRAPH-${name}.json`);
      console.log("Fetching graph from", filePath, "for dictionary", name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}", "utf-8");
      }
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      if(_uuid) {
        return json[_uuid] || {};
      }
      return json || {};
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}