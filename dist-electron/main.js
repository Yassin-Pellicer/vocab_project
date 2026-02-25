import { BrowserWindow, Menu, ipcMain, dialog, app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import path$1 from "path";
import fs$1 from "fs";
import { randomFillSync, randomUUID } from "node:crypto";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    resizable: true,
    transparent: false,
    hasShadow: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    show: false,
    // Don't show until config is loaded
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.openDevTools();
  Menu.setApplicationMenu(null);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  async function waitForConfig() {
    const configPath = path.join(process.env.APP_ROOT, "public", "user-config.json");
    const prefsPath = path.join(process.env.APP_ROOT, "public", "user-preferences.json");
    let configLoaded = false;
    let prefsLoaded = false;
    try {
      configLoaded = fs.existsSync(configPath) && fs.readFileSync(configPath, "utf-8").trim().length > 0;
    } catch {
    }
    try {
      prefsLoaded = fs.existsSync(prefsPath) && fs.readFileSync(prefsPath, "utf-8").trim().length > 0;
    } catch {
    }
    return configLoaded && prefsLoaded;
  }
  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    await win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  let tries = 0;
  while (!await waitForConfig() && tries < 50) {
    await new Promise((res) => setTimeout(res, 100));
    tries++;
  }
  win.show();
}
function fetchConjugation() {
  ipcMain.handle("fetchConjugation", async (_event, route, name, uuid) => {
    try {
      const filePath = path$1.join(route, `CONJ-${name}.json`);
      console.log("Fetching conjugation from", filePath, uuid);
      if (!fs$1.existsSync(filePath)) {
        fs$1.writeFileSync(filePath, "{}", "utf-8");
      }
      const data = fs$1.readFileSync(filePath, "utf-8");
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
      if (fs$1.existsSync(filePath)) {
        const data = fs$1.readFileSync(filePath, "utf-8");
        json = JSON.parse(data);
      }
      json[uuid] = conjugation;
      fs$1.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
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
      if (!fs$1.existsSync(filePath)) {
        return "";
      }
      const data = fs$1.readFileSync(filePath, "utf-8");
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
        if (markdown === "") {
          if (fs$1.existsSync(filePath)) {
            fs$1.unlinkSync(filePath);
            console.log(`Deleted markdown file at: ${filePath}`);
          }
        } else {
          fs$1.writeFileSync(filePath, markdown, "utf-8");
          console.log(`Saved markdown file at: ${filePath}`);
        }
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
        if (!fs$1.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }
        const json = JSON.parse(fs$1.readFileSync(filePath, "utf-8"));
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
          if (fs$1.existsSync(GraphfilePath)) {
            jsonGraph = JSON.parse(fs$1.readFileSync(GraphfilePath, "utf-8"));
          }
          jsonGraph[entryUuid] = {};
          fs$1.writeFileSync(GraphfilePath, JSON.stringify(jsonGraph, null, 2), "utf-8");
        }
        translations.push(entry);
        fs$1.writeFileSync(
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
        if (!fs$1.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }
        if (!fs$1.existsSync(folderPath)) {
          fs$1.mkdirSync(folderPath, { recursive: true });
        }
        fs$1.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        fs$1.mkdirSync(mdPath, { recursive: true });
        const configPath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!fs$1.existsSync(configPath)) {
          fs$1.writeFileSync(configPath, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        }
        const config = JSON.parse(fs$1.readFileSync(configPath, "utf-8"));
        if (!config.dictionaries) {
          config.dictionaries = {};
        }
        config.dictionaries[folderName] = {
          name: _name,
          route: folderPath
        };
        fs$1.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
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
        if (!fs$1.existsSync(filePath)) {
          throw new Error(`The file ${filePath} does not exist.`);
        }
        const data = fs$1.readFileSync(filePath, "utf-8");
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
          if (fs$1.existsSync(filePath2)) {
            json2 = JSON.parse(fs$1.readFileSync(filePath2, "utf-8"));
          }
          if (json2[_word]) {
            delete json2[_word];
          }
          fs$1.writeFileSync(filePath2, JSON.stringify(json2, null, 2), "utf-8");
          console.log("Graph entry deleted successfully");
        }
        fs$1.writeFileSync(
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
function removeDirRecursive$1(dir) {
  if (fs$1.existsSync(dir)) {
    fs$1.rmSync(dir, { recursive: true, force: true });
  }
}
function deleteDictionary() {
  ipcMain.handle(
    "deleteDictionary",
    async (_event, dictId) => {
      try {
        const configPath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!fs$1.existsSync(configPath)) {
          throw new Error("Config file not found.");
        }
        const config = JSON.parse(
          fs$1.readFileSync(configPath, "utf-8")
        );
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        const dictEntry = config.dictionaries[dictId];
        const dictPath = path$1.resolve(dictEntry.route);
        if (!fs$1.existsSync(dictPath) || !fs$1.statSync(dictPath).isDirectory()) {
          throw new Error(`Dictionary folder does not exist: ${dictPath}`);
        }
        removeDirRecursive$1(dictPath);
        delete config.dictionaries[dictId];
        fs$1.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        return {
          success: true,
          deletedId: dictId,
          deletedPath: dictPath
        };
      } catch (error) {
        console.error("❌ Error deleting dictionary:", error);
        throw new Error("Failed to delete dictionary.");
      }
    }
  );
}
function renameDictionary() {
  ipcMain.handle(
    "renameDictionary",
    async (_event, dictId, newName) => {
      try {
        const configPath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!fs$1.existsSync(configPath)) {
          throw new Error("Config file not found.");
        }
        const config = JSON.parse(
          fs$1.readFileSync(configPath, "utf-8")
        );
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        if (!newName || newName.trim() === "") {
          throw new Error("Dictionary name cannot be empty.");
        }
        config.dictionaries[dictId].name = newName.trim();
        fs$1.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        return {
          success: true,
          dictId,
          newName: newName.trim()
        };
      } catch (error) {
        console.error("❌ Error renaming dictionary:", error);
        throw new Error("Failed to rename dictionary.");
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
      const data = fs$1.readFileSync(filePath, "utf-8");
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
      const data = fs$1.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw new Error("Failed to load JSON file.");
    }
  });
}
function copyDirRecursive(src, dest) {
  fs$1.mkdirSync(dest, { recursive: true });
  const entries = fs$1.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path$1.join(src, entry.name);
    const destPath = path$1.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs$1.copyFileSync(srcPath, destPath);
    }
  }
}
function removeDirRecursive(dir) {
  if (fs$1.existsSync(dir)) {
    fs$1.rmSync(dir, { recursive: true, force: true });
  }
}
function moveDictionary() {
  ipcMain.handle(
    "moveDictionary",
    async (_event, dictId, newRoute) => {
      try {
        const configPath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!fs$1.existsSync(configPath)) {
          throw new Error("Config file not found.");
        }
        const config = JSON.parse(
          fs$1.readFileSync(configPath, "utf-8")
        );
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        const dictEntry = config.dictionaries[dictId];
        const oldRouteRaw = dictEntry.route;
        const srcDir = path$1.resolve(oldRouteRaw);
        const destParent = path$1.resolve(newRoute);
        if (!fs$1.existsSync(srcDir) || !fs$1.statSync(srcDir).isDirectory()) {
          throw new Error(`Source folder does not exist or is not a directory: ${srcDir}`);
        }
        if (!fs$1.existsSync(destParent) || !fs$1.statSync(destParent).isDirectory()) {
          throw new Error(`Destination folder does not exist or is not a directory: ${destParent}`);
        }
        const folderName = path$1.basename(srcDir);
        const newFolderPath = path$1.join(destParent, folderName);
        const isSubPath = (parent, child) => {
          const relative = path$1.relative(parent, child);
          return !!relative && !relative.startsWith("..") && !path$1.isAbsolute(relative);
        };
        if (srcDir === newFolderPath) {
          return { success: true, oldRoute: srcDir, newRoute: newFolderPath };
        }
        if (isSubPath(srcDir, newFolderPath)) {
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        }
        if (fs$1.existsSync(newFolderPath)) {
          throw new Error(
            `A folder named "${folderName}" already exists at the destination (${newFolderPath}).`
          );
        }
        let moved = false;
        try {
          fs$1.renameSync(srcDir, newFolderPath);
          moved = true;
        } catch (err) {
          if (err && err.code === "EXDEV") {
            copyDirRecursive(srcDir, newFolderPath);
            removeDirRecursive(srcDir);
            moved = true;
          } else {
            throw err;
          }
        }
        if (!moved) {
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        }
        config.dictionaries[dictId].route = newFolderPath;
        fs$1.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        return {
          success: true,
          oldRoute: srcDir,
          newRoute: newFolderPath
        };
      } catch (error) {
        console.error("❌ Error moving dictionary:", error);
        throw new Error("Failed to move dictionary.");
      }
    }
  );
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
      if (!fs$1.existsSync(filePath)) {
        fs$1.writeFileSync(filePath, "{}", "utf-8");
      }
      const data = fs$1.readFileSync(filePath, "utf-8");
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
        if (fs$1.existsSync(filePath)) {
          json = JSON.parse(fs$1.readFileSync(filePath, "utf-8"));
        }
        if (!json[origin.uuid]) {
          json[origin.uuid] = {};
        }
        if (!json[destination.uuid]) {
          json[destination.uuid] = {};
        }
        json[origin.uuid][destination.uuid] = destination.word;
        json[destination.uuid][origin.uuid] = origin.word;
        fs$1.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
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
    async (_event, route, name, origin, destination) => {
      try {
        const filePath = path$1.join(route, `GRAPH-${name}.json`);
        let json = {};
        if (fs$1.existsSync(filePath)) {
          json = JSON.parse(fs$1.readFileSync(filePath, "utf-8"));
        }
        if (json[origin.uuid]) {
          delete json[origin.uuid][destination.uuid];
        }
        if (json[destination.uuid]) {
          delete json[destination.uuid][origin.uuid];
        }
        fs$1.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
        console.log("Graph entry deleted successfully");
        return { success: true };
      } catch (error) {
        console.error("Error deleting graph entry:", error);
        throw new Error("Failed to delete graph entry.");
      }
    }
  );
}
function saveUserPreferences() {
  ipcMain.handle(
    "saveUserPreferences",
    async (_event, _config) => {
      try {
        const filePath = path$1.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-preferences.json"
        );
        if (!fs$1.existsSync(filePath)) {
          fs$1.mkdirSync(path$1.dirname(filePath), { recursive: true });
          fs$1.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }
        const data = fs$1.readFileSync(filePath, "utf-8");
        const json = JSON.parse(data);
        Object.assign(json, _config);
        fs$1.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf-8");
        return json;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    }
  );
}
function loadUserPreferences() {
  ipcMain.handle("loadUserPreferences", async (_event, _config) => {
    try {
      const filePath = path$1.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-preferences.json"
      );
      if (!fs$1.existsSync(filePath)) {
        fs$1.mkdirSync(path$1.dirname(filePath), { recursive: true });
        fs$1.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
      }
      const data = fs$1.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading user preferences file:", error);
      throw new Error("Failed to load user preferences file.");
    }
  });
}
function registerIpcHandlers() {
  loadTranslations();
  addTranslation();
  deleteTranslation();
  createDictionary();
  moveDictionary();
  deleteDictionary();
  renameDictionary();
  selectFolder();
  loadConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
  fetchGraph();
  saveGraph();
  deleteGraphEntry();
  saveUserPreferences();
  loadUserPreferences();
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
