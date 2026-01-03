import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveGraph() {
  ipcMain.handle(
    "saveGraph",
    async (_event, route, name, uuid, connection) => {
      try {
        const filePath = path.join(route, `GRAPH-${name}.json`);
        console.log("Saving graph to", filePath, "for uuid:", uuid);

        let json: Record<string, Record<string, string>> = {};

        if (fs.existsSync(filePath)) {
          json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        if (!json[uuid] || connection === undefined) {
          json[uuid] = {};
        }

        json[uuid][connection.uuid] = connection.word;

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");

        console.log("Graph saved successfully");
        return { success: true };
      } catch (error) {
        console.error("Error saving graph:", error);
        throw new Error("Failed to save graph.");
      }
    }
  );
}
