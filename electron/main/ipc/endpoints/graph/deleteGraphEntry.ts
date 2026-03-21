import { ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { broadcastToAllWindows } from "../../broadcast";

export default function deleteGraphEntry() {
  ipcMain.handle(
    "deleteGraphEntry",
    async (_event, route, name, origin, destination) => {
      try {
        const filePath = path.join(route, `GRAPH-${name}.json`);

        let json: Record<string, Record<string, string>> = {};

        if (fs.existsSync(filePath)) {
          json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        if (json[origin.uuid]) {
          delete json[origin.uuid][destination.uuid];
        }
        if (json[destination.uuid]) {
          delete json[destination.uuid][origin.uuid];
        }

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");

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
