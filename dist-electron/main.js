import { BrowserWindow, Menu, ipcMain, dialog, app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import path$1 from "path";
import fs from "fs";
import { randomFillSync, randomUUID } from "node:crypto";
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
function fetchConjugation() {
  ipcMain.handle("fetchConjugation", async (_event, route, name, uuid) => {
    try {
      const filePath = path$1.join(route, `CONJ-${name}.json`);
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
function saveConjugation() {
  ipcMain.handle("saveConjugation", async (_event, route, name, uuid, conjugation) => {
    try {
      const filePath = path$1.join(route, `CONJ-${name}.json`);
      console.log("Saving conjugation to", filePath, "for uuid:", uuid);
      let json = {};
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
function fetchMarkdown() {
  ipcMain.handle("fetchMarkdown", async (_event, _route, _name, _uuid) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path$1.join(normalizedRoute, `MD-${_name}`, `${_uuid}.md`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "", "utf-8");
      }
      const data = fs.readFileSync(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error(`Failed to load markdown file: ${error}`);
    }
  });
}
function saveMarkdown() {
  ipcMain.handle(
    "saveMarkdown",
    async (_event, _route, _name, _uuid, markdown) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        const filePath = path$1.join(normalizedRoute, `MD-${_name}`, `${_uuid}.md`);
        fs.writeFileSync(filePath, markdown, "utf-8");
        return { success: true, path: filePath };
      } catch (error) {
        console.error("Error saving markdown file:", error);
        throw new Error(`Failed to save markdown file: ${error}`);
      }
    }
  );
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
const native = { randomUUID };
function _v4(options, buf, offset) {
  var _a;
  options = options || {};
  const rnds = options.random ?? ((_a = options.rng) == null ? void 0 : _a.call(options)) ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  return _v4(options);
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
            (t) => t.uuid !== _word
          );
        } else {
          const entryUuid = entry.uuid || v4();
          entry.uuid = entryUuid;
          const GraphfilePath = path$1.join(_route, `GRAPH-${_name}.json`);
          console.log("Saving graph to", GraphfilePath, "for uuid:", entry.uuid);
          let jsonGraph = {};
          if (fs.existsSync(GraphfilePath)) {
            jsonGraph = JSON.parse(fs.readFileSync(GraphfilePath, "utf-8"));
          }
          jsonGraph[entryUuid] = {};
          fs.writeFileSync(GraphfilePath, JSON.stringify(jsonGraph, null, 2), "utf-8");
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
        throw new Error(`Failed to add translation. ${_route}, ${error}`);
      }
    }
  );
}
function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route, _name) => {
      try {
        const folderName = v4();
        const folderPath = path$1.resolve(_route, folderName);
        const filePath = path$1.join(folderPath, `${folderName}.json`);
        const mdPath = path$1.join(folderPath, "MD-" + folderName);
        if (!fs.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        fs.mkdirSync(mdPath, { recursive: true });
        const configPath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!fs.existsSync(configPath)) {
          fs.writeFileSync(configPath, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        }
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (!config.dictionaries) {
          config.dictionaries = {};
        }
        config.dictionaries[folderName] = {
          name: _name,
          route: folderPath
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        return {
          success: true,
          folderName,
          folderPath
        };
      } catch (error) {
        console.error("❌ Error creating dictionary:", error);
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
        translations = translations.filter((t) => t.uuid !== _word);
        {
          const filePath2 = path$1.join(_route, `GRAPH-${_name}.json`);
          console.log(
            "Deleting graph entry from",
            filePath2,
            "for uuid:",
            _word
          );
          let json2 = {};
          if (fs.existsSync(filePath2)) {
            json2 = JSON.parse(fs.readFileSync(filePath2, "utf-8"));
          }
          if (json2[_word]) {
            delete json2[_word];
          }
          fs.writeFileSync(filePath2, JSON.stringify(json2, null, 2), "utf-8");
          console.log("Graph entry deleted successfully");
        }
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
  ipcMain.handle("loadConfig", async () => {
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
function fetchGraph() {
  ipcMain.handle("fetchGraph", async (_event, route, name, _uuid) => {
    try {
      const filePath = path$1.join(route, `GRAPH-${name}.json`);
      console.log("Fetching graph from", filePath, "for dictionary", name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}", "utf-8");
      }
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      if (_uuid) {
        return json[_uuid] || {};
      }
      return json || {};
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
function saveGraph() {
  ipcMain.handle(
    "saveGraph",
    async (_event, route, name, origin, destination) => {
      try {
        const filePath = path$1.join(route, `GRAPH-${name}.json`);
        let json = {};
        if (fs.existsSync(filePath)) {
          json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
        if (!json[origin.uuid]) {
          json[origin.uuid] = {};
        }
        if (!json[destination.uuid]) {
          json[destination.uuid] = {};
        }
        json[origin.uuid][destination.uuid] = destination.word;
        json[destination.uuid][origin.uuid] = origin.word;
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
function deleteGraphEntry() {
  ipcMain.handle(
    "deleteGraphEntry",
    async (_event, route, name, uuid, wordToDelete) => {
      try {
        const filePath = path$1.join(route, `GRAPH-${name}.json`);
        console.log("Deleting graph entry from", filePath, "for uuid:", uuid);
        let json = {};
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
function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
  createDictionary();
  selectFolder();
  loadConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
  fetchGraph();
  saveGraph();
  deleteGraphEntry();
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
