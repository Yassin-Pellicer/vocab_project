import { BrowserWindow, Menu, ipcMain, app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import path$1 from "path";
import fs from "fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    // or false if you want custom frame
    transparent: true,
    hasShadow: false,
    titleBarStyle: "hiddenInset",
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  Menu.setApplicationMenu(null);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
function addTranslation() {
  ipcMain.handle(
    "addTranslation",
    async (_event, entry, _word) => {
      try {
        const filePath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "german.json"
        );
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        }
        console.log(_word);
        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);
        let translations = Array.isArray(json) ? json : [];
        translations = translations.filter(
          (t) => t.original !== _word.original
        );
        translations.push(entry);
        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );
        return { success: true, message: "Translation added successfully." };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error("Failed to add translation.");
      }
    }
  );
}
function deleteTranslation() {
  ipcMain.handle(
    "deleteTranslation",
    async (_event, _word) => {
      try {
        const filePath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "german.json"
        );
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        }
        const data = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);
        let translations = Array.isArray(json) ? json : [];
        translations = translations.filter(
          (t) => t.original !== _word.original
        );
        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );
        return { success: true, message: "Translation added successfully." };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error("Failed to add translation.");
      }
    }
  );
}
function loadTranslations() {
  ipcMain.handle("loadTranslations", async (_event, _arg) => {
    try {
      const filePath = path$1.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "german.json"
      );
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
