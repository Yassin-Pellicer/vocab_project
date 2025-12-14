import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function fetchConjugation() {
  ipcMain.handle("fetchConjugation", async (_event, route, name, uuid) => {
    try {
      const filePath = path.join(route, `CONJ-${name}.json`);
      console.log("Fetching conjugation from", filePath, uuid);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}", "utf-8");
      }
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json[uuid] || {};
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}