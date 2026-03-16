import { BrowserWindow, Menu, ipcMain, app, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import path$1 from "path";
import fs from "fs";
import { randomFillSync, randomUUID } from "node:crypto";
import fs$1, { promises } from "node:fs";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
function createWindow(initialRoute, options) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      zoomFactor: 1
    }
  });
  win.webContents.setVisualZoomLevelLimits(1, 5);
  win.webContents.openDevTools();
  Menu.setApplicationMenu(null);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("before-input-event", (event, input) => {
    if (!input.control) return;
    if (input.key === "+") {
      const current = win.webContents.getZoomFactor();
      win.webContents.setZoomFactor(Math.min(current + 0.1, 5));
      event.preventDefault();
    } else if (input.key === "-") {
      const current = win.webContents.getZoomFactor();
      win.webContents.setZoomFactor(Math.max(current - 0.1, 0.5));
      event.preventDefault();
    } else if (input.key === "0") {
      win.webContents.setZoomFactor(1);
      event.preventDefault();
    }
  });
  const search = typeof (options == null ? void 0 : options.hideSidebar) === "boolean" ? `?hideSidebar=${options.hideSidebar ? "1" : "0"}` : "";
  if (VITE_DEV_SERVER_URL) {
    const hash = initialRoute ? `#${encodeURIComponent(initialRoute)}` : "";
    win.loadURL(`${VITE_DEV_SERVER_URL}${search}${hash}`);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: initialRoute ? encodeURIComponent(initialRoute) : void 0,
      search: search || void 0
    });
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
      const filePath = path$1.join(
        normalizedRoute,
        `MD-${_name}`,
        `${_uuid}.json`
      );
      if (!fs.existsSync(filePath)) {
        return { type: "doc", content: [] };
      }
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        return JSON.parse(data);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error(`Failed to load markdown file: ${error}`);
    }
  });
}
function saveMarkdown() {
  ipcMain.handle(
    "saveMarkdown",
    async (_event, _route, _name, _uuid, content) => {
      var _a;
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        const filePath = path$1.join(
          normalizedRoute,
          `MD-${_name}`,
          `${_uuid}.json`
        );
        const dir = path$1.dirname(filePath);
        const isEmptyDoc = content && content.type === "doc" && Array.isArray(content.content) && content.content.length === 1 && content.content[0].type === "paragraph" && ((_a = content.content[0].attrs) == null ? void 0 : _a.textAlign) === null && !content.content[0].content;
        if (content === null || isEmptyDoc) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return { success: true };
        }
        fs.mkdirSync(dir, { recursive: true });
        if (content === void 0) {
          fs.writeFileSync(filePath, "", "utf-8");
        } else {
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
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
function broadcastToAllWindows(channel, payload) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue;
    win.webContents.send(channel, payload);
  }
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
        broadcastToAllWindows("app-data-changed");
        return { success: true };
      } catch (error) {
        console.error("Error adding translation:", error);
        throw new Error(`Failed to add translation. ${_route}, ${error}`);
      }
    }
  );
}
const USER_CONFIG_FILENAME = "user-config.json";
const USER_PREFERENCES_FILENAME = "user-preferences.json";
const getUserDataDir = () => app.getPath("userData");
const getUserDataFilePath = (filename) => path.join(getUserDataDir(), filename);
async function ensureParentDir(filePath) {
  await promises.mkdir(path.dirname(filePath), { recursive: true });
}
async function readJsonFile(filePath, defaultValue) {
  try {
    const raw = await promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      await ensureParentDir(filePath);
      await promises.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    throw error;
  }
}
async function writeJsonFile(filePath, value) {
  await ensureParentDir(filePath);
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await promises.writeFile(tmpPath, JSON.stringify(value, null, 2), "utf-8");
  await promises.rename(tmpPath, filePath);
}
const defaultUserConfig = {};
const defaultUserPreferences = {};
const getUserConfigPath = () => getUserDataFilePath(USER_CONFIG_FILENAME);
const getUserPreferencesPath = () => getUserDataFilePath(USER_PREFERENCES_FILENAME);
async function readUserConfig() {
  const filePath = getUserConfigPath();
  return readJsonFile(filePath, defaultUserConfig);
}
async function writeUserConfig(config) {
  return writeJsonFile(getUserConfigPath(), config);
}
async function readUserPreferences() {
  const filePath = getUserPreferencesPath();
  return readJsonFile(filePath, defaultUserPreferences);
}
async function writeUserPreferences(prefs) {
  return writeJsonFile(getUserPreferencesPath(), prefs);
}
function createDictionary() {
  ipcMain.handle(
    "createDictionary",
    async (_event, _route, _name) => {
      try {
        const folderName = v4();
        const folderPath = path.resolve(_route, folderName);
        const filePath = path.join(folderPath, `${folderName}.json`);
        const mdPath = path.join(folderPath, "MD-" + folderName);
        const notesPath = path.join(folderPath, "NOTES-" + folderName);
        if (!fs$1.existsSync(_route)) {
          throw new Error(`The folder ${_route} does not exist.`);
        }
        if (!fs$1.existsSync(folderPath)) {
          fs$1.mkdirSync(folderPath, { recursive: true });
        }
        fs$1.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
        fs$1.mkdirSync(mdPath, { recursive: true });
        fs$1.mkdirSync(notesPath, { recursive: true });
        const config = await readUserConfig();
        if (!config.dictionaries) {
          config.dictionaries = {};
        }
        config.dictionaries[folderName] = {
          name: _name,
          route: folderPath,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        };
        await writeUserConfig(config);
        broadcastToAllWindows("app-data-changed");
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
        const translations = Array.isArray(json) ? json : [];
        const nextTranslations = translations.filter((t) => t.uuid !== _word);
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
          JSON.stringify(nextTranslations, null, 2),
          "utf-8"
        );
        broadcastToAllWindows("app-data-changed");
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
        const config = await readUserConfig();
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        const dictEntry = config.dictionaries[dictId];
        const dictPath = path.resolve(dictEntry.route);
        if (!fs$1.existsSync(dictPath) || !fs$1.statSync(dictPath).isDirectory()) {
          throw new Error(`Dictionary folder does not exist: ${dictPath}`);
        }
        removeDirRecursive$1(dictPath);
        delete config.dictionaries[dictId];
        await writeUserConfig(config);
        broadcastToAllWindows("app-data-changed");
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
        const config = await readUserConfig();
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        if (!newName || newName.trim() === "") {
          throw new Error("Dictionary name cannot be empty.");
        }
        config.dictionaries[dictId].name = newName.trim();
        await writeUserConfig(config);
        broadcastToAllWindows("app-data-changed");
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
      return await readUserConfig();
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
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data || "[]");
      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.error("Error reading JSON file:", error);
      return [];
    }
  });
}
async function copyDirRecursive(src, dest) {
  await promises.mkdir(dest, { recursive: true });
  const entries = await promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      await promises.copyFile(srcPath, destPath);
    }
  }
}
const removeDirRecursive = (dir) => promises.rm(dir, { recursive: true, force: true });
function moveDictionary() {
  ipcMain.handle(
    "moveDictionary",
    async (_event, dictId, newRoute) => {
      try {
        const config = await readUserConfig();
        if (!config.dictionaries || !config.dictionaries[dictId]) {
          throw new Error(`Dictionary with id "${dictId}" not found in config.`);
        }
        const dictEntry = config.dictionaries[dictId];
        const oldRouteRaw = dictEntry.route;
        const srcDir = path.resolve(oldRouteRaw);
        const destParent = path.resolve(newRoute);
        const srcStats = await promises.stat(srcDir).catch(() => null);
        if (!(srcStats == null ? void 0 : srcStats.isDirectory())) {
          throw new Error(`Source folder does not exist or is not a directory: ${srcDir}`);
        }
        const destStats = await promises.stat(destParent).catch(() => null);
        if (!(destStats == null ? void 0 : destStats.isDirectory())) {
          throw new Error(`Destination folder does not exist or is not a directory: ${destParent}`);
        }
        const folderName = path.basename(srcDir);
        const newFolderPath = path.join(destParent, folderName);
        const isSubPath = (parent, child) => {
          const relative = path.relative(parent, child);
          return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
        };
        if (srcDir === newFolderPath) {
          return { success: true, oldRoute: srcDir, newRoute: newFolderPath };
        }
        if (isSubPath(srcDir, newFolderPath)) {
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        }
        if (await promises.stat(newFolderPath).catch(() => null)) {
          throw new Error(
            `A folder named "${folderName}" already exists at the destination (${newFolderPath}).`
          );
        }
        let moved = false;
        try {
          await promises.rename(srcDir, newFolderPath);
          moved = true;
        } catch (error) {
          if (typeof error === "object" && error !== null && "code" in error && error.code === "EXDEV") {
            await copyDirRecursive(srcDir, newFolderPath);
            await removeDirRecursive(srcDir);
            moved = true;
          } else {
            throw error;
          }
        }
        if (!moved) {
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        }
        config.dictionaries[dictId].route = newFolderPath;
        await writeUserConfig(config);
        broadcastToAllWindows("app-data-changed");
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
    async (_event, route, name, origin, destination) => {
      try {
        const filePath = path$1.join(route, `GRAPH-${name}.json`);
        let json = {};
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
        const current = await readUserPreferences();
        const merged = { ...current, ..._config };
        await writeUserPreferences(merged);
        broadcastToAllWindows("app-data-changed");
        return merged;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    }
  );
}
function loadUserPreferences() {
  ipcMain.handle("loadUserPreferences", async () => {
    try {
      return await readUserPreferences();
    } catch (error) {
      console.error("Error reading user preferences file:", error);
      throw new Error("Failed to load user preferences file.");
    }
  });
}
function editConfig() {
  ipcMain.handle(
    "editConfig",
    async (_event, _config) => {
      try {
        const current = await readUserConfig();
        const merged = { ...current, ..._config };
        await writeUserConfig(merged);
        broadcastToAllWindows("app-data-changed");
        return merged;
      } catch (error) {
        console.error("Error saving user preferences file:", error);
        throw new Error("Failed to save user preferences file.");
      }
    }
  );
}
function fetchNoteIndex() {
  ipcMain.handle("fetchNoteIndex", async (_event, _route, _name) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path$1.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `NOTES-INDEX-${_name}.json`
      );
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path$1.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
      }
      const data = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      console.error("Error reading markdown file:", error);
      throw new Error(`Failed to load markdown file: ${error}`);
    }
  });
}
function saveNoteIndex() {
  ipcMain.handle(
    "saveNoteIndex",
    async (_event, _route, _name, currentConfig) => {
      try {
        const normalizedRoute = _route.replace(/\\/g, "/");
        const indexFilePath = path$1.join(
          normalizedRoute,
          `NOTES-${_name}`,
          `NOTES-INDEX-${_name}.json`
        );
        fs.writeFileSync(indexFilePath, JSON.stringify(currentConfig, null, 2), "utf-8");
        broadcastToAllWindows("notes-changed", {
          route: normalizedRoute,
          name: _name
        });
        return { success: true, path: indexFilePath };
      } catch (error) {
        console.error("Error saving JSON file:", error);
        throw new Error(`Failed to save JSON file: ${error}`);
      }
    }
  );
}
function saveNotes() {
  ipcMain.handle("saveNotes", async (_event, route, name, uuid, content) => {
    try {
      if (typeof route !== "string" || typeof name !== "string") {
        throw new Error("Invalid note route/name.");
      }
      if (typeof uuid !== "string" || !uuid.trim()) {
        return { success: false, error: "Invalid note id." };
      }
      const normalizedRoute = route.replace(/\\/g, "/");
      const filePath = path$1.join(
        normalizedRoute,
        `NOTES-${name}`,
        `${uuid}.json`
      );
      const dir = path$1.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      const safeContent = content && typeof content === "object" ? content : { type: "doc", content: [] };
      fs.writeFileSync(filePath, JSON.stringify(safeContent, null, 2), "utf-8");
      broadcastToAllWindows("notes-changed", {
        route: normalizedRoute,
        name,
        uuid
      });
      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error saving markdown file:", error);
      throw new Error(`Failed to save markdown file: ${error}`);
    }
  });
}
function fetchNotes() {
  ipcMain.handle("fetchNotes", async (_event, _route, _name, _uuid) => {
    try {
      const normalizedRoute = _route.replace(/\\/g, "/");
      const filePath = path$1.join(
        normalizedRoute,
        `NOTES-${_name}`,
        `${_uuid}.json`
      );
      if (!fs.existsSync(filePath)) {
        return { type: "doc", content: [] };
      }
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        return JSON.parse(data);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (error) {
      console.error("Error reading note file:", error);
      return { type: "doc", content: [] };
    }
  });
}
function minimizeWindow() {
  ipcMain.handle("window-minimize", () => {
    const win = BrowserWindow.getFocusedWindow();
    win == null ? void 0 : win.minimize();
  });
}
function maximizeWindow() {
  ipcMain.handle("window-maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}
function closeWindow() {
  ipcMain.handle("window-close", () => {
    const win = BrowserWindow.getFocusedWindow();
    win == null ? void 0 : win.close();
  });
}
function normalizeRoute(route) {
  if (typeof route !== "string") return void 0;
  const trimmed = route.trim();
  if (!trimmed) return void 0;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function openNewWindow() {
  ipcMain.handle("window-open-new", (_event, route) => {
    createWindow(normalizeRoute(route), { hideSidebar: true });
  });
}
function coerceMessages(value) {
  if (!Array.isArray(value)) return [];
  return value.map((m) => {
    if (typeof m !== "object" || m === null) return null;
    const role = "role" in m ? m.role : void 0;
    const content = "content" in m ? m.content : void 0;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed) return null;
    return { role, content: trimmed };
  }).filter((m) => Boolean(m));
}
function getOutputText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }
  return "";
}
function sendChat() {
  ipcMain.handle("chatSend", async (_event, rawMessages) => {
    var _a;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENAI_API_KEY. Set it in your environment (or a .env/.env.local file) before starting the app."
      );
    }
    const messages = coerceMessages(rawMessages);
    if (messages.length === 0) {
      throw new Error("No messages provided.");
    }
    const developerPrompt = "You are a helpful, concise assistant inside a vocabulary app. Answer in the user's language. Prefer short, actionable answers. If asked for vocabulary help, include examples and brief explanations.Don't deviate from your task. Politely decline anything that isnt related with learning a language";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          { role: "developer", content: developerPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content }))
        ]
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = ((_a = payload == null ? void 0 : payload.error) == null ? void 0 : _a.message) || `OpenAI request failed with status ${response.status}.`;
      throw new Error(message);
    }
    const text = payload ? getOutputText(payload) : "";
    if (!text) throw new Error("Empty response from model.");
    return { text };
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
  editConfig();
  fetchMarkdown();
  saveMarkdown();
  fetchConjugation();
  saveConjugation();
  fetchGraph();
  saveGraph();
  deleteGraphEntry();
  saveUserPreferences();
  loadUserPreferences();
  fetchNoteIndex();
  saveNoteIndex();
  saveNotes();
  fetchNotes();
  sendChat();
  minimizeWindow();
  maximizeWindow();
  closeWindow();
  openNewWindow();
}
function parseEnvFile(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    if (value) result[key] = value;
  }
  return result;
}
async function readEnvFileIfExists(filePath) {
  try {
    const raw = await promises.readFile(filePath, "utf-8");
    return parseEnvFile(raw);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return null;
    }
    return null;
  }
}
async function loadEnvIfPresent() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local"),
    process.env.APP_ROOT ? path.join(process.env.APP_ROOT, ".env") : null,
    process.env.APP_ROOT ? path.join(process.env.APP_ROOT, ".env.local") : null
  ].filter((p) => Boolean(p));
  for (const filePath of candidates) {
    const parsed = await readEnvFileIfExists(filePath);
    if (!parsed) continue;
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) process.env[key] = value;
    }
  }
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
  void loadEnvIfPresent();
  registerIpcHandlers();
  createWindow();
});
