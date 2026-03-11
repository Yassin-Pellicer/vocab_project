import { ipcMain } from "electron";
import path from "path";
import fs from "fs";

export default function saveImage() {
  ipcMain.handle("saveImage", async (_event, route, name, buffer: number[], filename: string) => {
    try {
      const normalizedRoute = route.replace(/\\/g, "/");

      const resourcesDir = path.join(
        normalizedRoute,
        `NOTES-${name}`,
        `RESOURCES`
      );

      fs.mkdirSync(resourcesDir, { recursive: true });

      console.log("SAVED IMGE SAVED IMG")

      const ext = path.extname(filename)
      const base = path.basename(filename, ext)
      const unique = `${base}-${Date.now()}${ext}`
      const filePath = path.join(resourcesDir, unique)

      fs.writeFileSync(filePath, Buffer.from(buffer));

      const fileUrl = `file://${filePath.replace(/\\/g, "/")}`

      return { success: true, url: fileUrl }
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error(`Failed to save image: ${error}`);
    }
  });
}