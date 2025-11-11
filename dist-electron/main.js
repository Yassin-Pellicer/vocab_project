import { BrowserWindow, Menu, ipcMain, dialog, app } from "electron";
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
    frame: false,
    resizable: true,
    transparent: false,
    hasShadow: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.openDevTools();
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
function fetchMarkdown() {
  ipcMain.handle("fetchMarkdown", async (_event, _route, _name) => {
    try {
      const filePath = path$1.join(_route, `${_name}.md`);
      const data = fs.readFileSync(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error("Failed to load markdown file.");
    }
  });
}
function addTranslation() {
  ipcMain.handle(
    "addTranslation",
    async (_event, entry, _word, _route, _name) => {
      try {
        const filePath = path$1.join(_route, `${_name}.json`);
        if (!fs.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }
        const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        let translations = Array.isArray(json) ? json : [];
        if (_word) {
          translations = translations.filter(
            (t) => t.original !== _word.original
          );
        }
        translations.push(entry);
        fs.writeFileSync(
          filePath,
          JSON.stringify(translations, null, 2),
          "utf-8"
        );
        return { success: true };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to add translation. ${error}`);
      }
    }
  );
}
function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route, _name) => {
      try {
        if (!fs.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }
        fs.writeFileSync(
          path$1.join(_route, `${_name}.json`),
          JSON.stringify([], null, 2),
          "utf-8"
        );
        const config = JSON.parse(
          fs.readFileSync(
            path$1.join(
              process.env.APP_ROOT || __dirname,
              "public",
              "user-config.json"
            ),
            "utf-8"
          )
        );
        config.dictionaries = config.dictionaries.filter(
          (t) => t.name !== _name
        );
        config.dictionaries.push({
          name: _name,
          path: _route
        });
        fs.writeFileSync(
          path$1.join(
            process.env.APP_ROOT || __dirname,
            "public",
            "user-config.json"
          ),
          JSON.stringify(config, null, 2),
          "utf-8"
        );
        return {
          success: true
        };
      } catch (error) {
        console.error("Error creating dictionary:", error);
        throw new Error("Failed to create dictionary.");
      }
    }
  );
}
function deleteTranslation() {
  ipcMain.handle(
    "deleteTranslation",
    async (_event, _word, _route, _name) => {
      try {
        const filePath = path$1.join(_route, `${_name}.json`);
        if (!fs.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
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
        throw new Error(`Failed to delete translation. ${error}`);
      }
    }
  );
}
function loadConfig() {
  ipcMain.handle("loadConfig", async (_event) => {
    try {
      const filePath = path$1.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
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
function loadTranslations() {
  ipcMain.handle("loadTranslations", async (_event, _route, _name) => {
    try {
      const filePath = path$1.join(_route, `${_name}.json`);
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
function selectFolder() {
  ipcMain.handle("selectFolder", async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"]
      });
      if (result.canceled) {
        return null;
      }
      return result.filePaths[0];
    } catch (error) {
      console.error("Error selecting folder:", error);
      throw new Error("Failed to select folder.");
    }
  });
}
function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
  createDictionary();
  selectFolder();
  loadConfig();
  fetchMarkdown();
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
