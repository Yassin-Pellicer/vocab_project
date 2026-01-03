import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function deleteGraphEntry() {
  ipcMain.handle(
    "deleteGraphEntry",
    async (_event, route, name, uuid, wordToDelete) => {
      try {
        const filePath = path.join(route, `GRAPH-${name}.json`);
        console.log("Deleting graph entry from", filePath, "for uuid:", uuid);

        let json: Record<string, Record<string, string>> = {};

        if (fs.existsSync(filePath)) {
          json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        if (json[uuid]) {
          delete json[uuid][wordToDelete];
        }

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");

        console.log("Graph entry deleted successfully");
        return { success: true };
      } catch (error) {
        console.error("Error deleting graph entry:", error);
        throw new Error("Failed to delete graph entry.");
      }
    }
  );
}