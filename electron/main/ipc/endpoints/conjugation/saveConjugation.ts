import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveConjugation() {
  ipcMain.handle("saveConjugation", async (_event, route, name, uuid, conjugation) => {
    try {
      const filePath = path.join(route, `CONJ-${name}.json`);
      console.log("Saving conjugation to", filePath, "for uuid:", uuid);
      
      let json: Record<string, any> = {};
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        json = JSON.parse(data);
      }
      
      json[uuid] = conjugation;
      
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
      
      console.log("Conjugation saved successfully");
      return { success: true };
    } catch (error) {
      console.error("Error saving conjugation:", error);
      throw new Error("Failed to save conjugation.");
    }
  });
}