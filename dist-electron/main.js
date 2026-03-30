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
const isRecord = (value) => typeof value === "object" && value !== null;
const toUniqueSortedIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return Array.from(
    new Set(ids.filter((id) => typeof id === "string"))
  ).sort();
};
const arraysEqual = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);
const getEntryLabel = (entry, fallback) => {
  var _a, _b;
  return ((_b = (_a = entry.pair[0]) == null ? void 0 : _a.original) == null ? void 0 : _b.word) || fallback;
};
const getDictionaryFilePath = (route, name) => path$1.join(route, `${name}.json`);
const getLegacyGraphFilePath = (route, name) => path$1.join(route, `GRAPH-${name}.json`);
const readTranslations = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
};
const writeTranslations = (filePath, translations) => {
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), "utf-8");
};
const readLegacyGraphPayload = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw || "{}");
    return isRecord(parsed) ? parsed : {};
  } catch (error) {
    console.error("Failed to read legacy graph payload:", error);
    return {};
  }
};
const normalizeTranslationGraphLinks = (translations, legacyGraph = {}) => {
  const entryMap = /* @__PURE__ */ new Map();
  translations.forEach((entry) => {
    if (!entry.uuid) return;
    entryMap.set(entry.uuid, entry);
  });
  const linkSets = /* @__PURE__ */ new Map();
  entryMap.forEach((entry, entryId) => {
    const existingIds = toUniqueSortedIds(entry.linkedWordIds).filter(
      (targetId) => targetId !== entryId && entryMap.has(targetId)
    );
    linkSets.set(entryId, new Set(existingIds));
  });
  Object.entries(legacyGraph).forEach(([sourceId, targets]) => {
    if (!entryMap.has(sourceId) || !isRecord(targets)) return;
    Object.keys(targets).forEach((targetId) => {
      var _a;
      if (targetId === sourceId) return;
      if (!entryMap.has(targetId)) return;
      (_a = linkSets.get(sourceId)) == null ? void 0 : _a.add(targetId);
    });
  });
  linkSets.forEach((targets, sourceId) => {
    Array.from(targets).forEach((targetId) => {
      var _a;
      if (targetId === sourceId || !linkSets.has(targetId)) {
        targets.delete(targetId);
        return;
      }
      (_a = linkSets.get(targetId)) == null ? void 0 : _a.add(sourceId);
    });
  });
  let changed = false;
  entryMap.forEach((entry, entryId) => {
    const nextIds = Array.from(linkSets.get(entryId) ?? []).sort();
    const prevIds = toUniqueSortedIds(entry.linkedWordIds).filter(
      (targetId) => targetId !== entryId && entryMap.has(targetId)
    );
    if (!arraysEqual(prevIds, nextIds)) {
      changed = true;
    }
    entry.linkedWordIds = nextIds;
  });
  return changed;
};
const loadTranslationsWithGraphLinks = (route, name) => {
  const dictionaryFilePath = getDictionaryFilePath(route, name);
  const legacyGraphFilePath = getLegacyGraphFilePath(route, name);
  if (!fs.existsSync(dictionaryFilePath)) {
    throw new Error(`The file ${dictionaryFilePath} does not exist.`);
  }
  const translations = readTranslations(dictionaryFilePath);
  const legacyGraph = readLegacyGraphPayload(legacyGraphFilePath);
  const changed = normalizeTranslationGraphLinks(translations, legacyGraph);
  return {
    dictionaryFilePath,
    legacyGraphFilePath,
    translations,
    changed
  };
};
const buildGraphPayload = (translations) => {
  const payload = {};
  const entryMap = /* @__PURE__ */ new Map();
  translations.forEach((entry) => {
    if (!entry.uuid) return;
    entryMap.set(entry.uuid, entry);
    payload[entry.uuid] = {};
  });
  entryMap.forEach((entry, entryId) => {
    const targets = entry.linkedWordIds ?? [];
    targets.forEach((targetId) => {
      const targetEntry = entryMap.get(targetId);
      if (!targetEntry) return;
      payload[entryId][targetId] = getEntryLabel(targetEntry, targetId);
    });
  });
  return payload;
};
const removeLegacyGraphFileIfExists = (legacyGraphFilePath) => {
  if (!fs.existsSync(legacyGraphFilePath)) return;
  try {
    fs.unlinkSync(legacyGraphFilePath);
  } catch (error) {
    console.error("Failed to remove legacy graph file:", error);
  }
};
function addTranslation() {
  ipcMain.handle(
    "addTranslation",
    async (_event, entry, _word, _route, _name) => {
      try {
        const {
          dictionaryFilePath,
          legacyGraphFilePath,
          translations: loadedTranslations,
          changed: normalizedChanged
        } = loadTranslationsWithGraphLinks(_route, _name);
        let translations = [...loadedTranslations];
        let changed = normalizedChanged;
        if (_word) {
          const existingEntry = translations.find(
            (current) => current.uuid === _word
          );
          translations = translations.filter(
            (t) => t.uuid !== _word
          );
          entry.linkedWordIds = (existingEntry == null ? void 0 : existingEntry.linkedWordIds) ? [...existingEntry.linkedWordIds] : [];
        } else {
          const entryUuid = entry.uuid || v4();
          entry.uuid = entryUuid;
          if (!Array.isArray(entry.linkedWordIds)) {
            entry.linkedWordIds = [];
          }
        }
        if (entry.uuid) {
          const uniqueLinks = Array.from(
            new Set(
              (entry.linkedWordIds ?? []).filter(
                (targetId) => typeof targetId === "string" && targetId !== entry.uuid
              )
            )
          ).sort();
          entry.linkedWordIds = uniqueLinks;
        }
        translations.push(entry);
        const graphChanged = normalizeTranslationGraphLinks(translations);
        changed = changed || graphChanged;
        writeTranslations(dictionaryFilePath, translations);
        if (changed || fs.existsSync(legacyGraphFilePath)) {
          removeLegacyGraphFileIfExists(legacyGraphFilePath);
        }
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
        const dictionaryFilePath = path$1.join(_route, `${_name}.json`);
        if (!fs.existsSync(dictionaryFilePath)) {
          throw new Error(`The file ${dictionaryFilePath} does not exist.`);
        }
        const {
          dictionaryFilePath: resolvedDictionaryFilePath,
          legacyGraphFilePath,
          translations,
          changed: normalizedChanged
        } = loadTranslationsWithGraphLinks(_route, _name);
        let nextTranslations = translations.filter((t) => t.uuid !== _word);
        let changed = normalizedChanged || nextTranslations.length !== translations.length;
        nextTranslations = nextTranslations.map((entry) => {
          var _a;
          if (!((_a = entry.linkedWordIds) == null ? void 0 : _a.includes(_word))) return entry;
          changed = true;
          return {
            ...entry,
            linkedWordIds: entry.linkedWordIds.filter((id) => id !== _word)
          };
        });
        if (normalizeTranslationGraphLinks(nextTranslations)) {
          changed = true;
        }
        if (changed) {
          writeTranslations(resolvedDictionaryFilePath, nextTranslations);
        }
        removeLegacyGraphFileIfExists(legacyGraphFilePath);
        broadcastToAllWindows("graph-changed", {
          route: _route,
          name: _name
        });
        broadcastToAllWindows("app-data-changed");
        return { success: true, message: "Translation deleted successfully." };
      } catch (error) {
        console.error("Error deleting translation:", error);
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
      const dictionaryFilePath = getDictionaryFilePath(route, name);
      if (!fs.existsSync(dictionaryFilePath)) {
        return _uuid ? {} : {};
      }
      const {
        dictionaryFilePath: resolvedDictionaryPath,
        legacyGraphFilePath,
        translations,
        changed
      } = loadTranslationsWithGraphLinks(route, name);
      if (changed) {
        writeTranslations(resolvedDictionaryPath, translations);
      }
      removeLegacyGraphFileIfExists(legacyGraphFilePath);
      const payload = buildGraphPayload(translations);
      if (_uuid) {
        return payload[_uuid] || {};
      }
      return payload;
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
        const {
          dictionaryFilePath,
          legacyGraphFilePath,
          translations,
          changed: normalizedChanged
        } = loadTranslationsWithGraphLinks(route, name);
        const originId = origin == null ? void 0 : origin.uuid;
        const destinationId = destination == null ? void 0 : destination.uuid;
        if (!originId || !destinationId) {
          throw new Error("Both origin and destination ids are required.");
        }
        if (originId === destinationId) {
          if (normalizedChanged) {
            writeTranslations(dictionaryFilePath, translations);
          }
          removeLegacyGraphFileIfExists(legacyGraphFilePath);
          return { success: true };
        }
        const originEntry = translations.find((entry) => entry.uuid === originId);
        const destinationEntry = translations.find(
          (entry) => entry.uuid === destinationId
        );
        if (!originEntry || !destinationEntry) {
          throw new Error("Could not find one of the requested words.");
        }
        const originLinks = new Set(originEntry.linkedWordIds ?? []);
        const destinationLinks = new Set(destinationEntry.linkedWordIds ?? []);
        const addedToOrigin = !originLinks.has(destinationId);
        const addedToDestination = !destinationLinks.has(originId);
        originLinks.add(destinationId);
        destinationLinks.add(originId);
        originEntry.linkedWordIds = Array.from(originLinks).sort();
        destinationEntry.linkedWordIds = Array.from(destinationLinks).sort();
        const changed = normalizedChanged || addedToOrigin || addedToDestination;
        if (changed) {
          writeTranslations(dictionaryFilePath, translations);
        }
        removeLegacyGraphFileIfExists(legacyGraphFilePath);
        broadcastToAllWindows("graph-changed", { route, name });
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
      var _a, _b;
      try {
        const {
          dictionaryFilePath,
          legacyGraphFilePath,
          translations,
          changed: normalizedChanged
        } = loadTranslationsWithGraphLinks(route, name);
        const originId = origin == null ? void 0 : origin.uuid;
        const destinationId = destination == null ? void 0 : destination.uuid;
        if (!originId || !destinationId) {
          throw new Error("Both origin and destination ids are required.");
        }
        const originEntry = translations.find((entry) => entry.uuid === originId);
        const destinationEntry = translations.find(
          (entry) => entry.uuid === destinationId
        );
        let changed = normalizedChanged;
        if ((_a = originEntry == null ? void 0 : originEntry.linkedWordIds) == null ? void 0 : _a.includes(destinationId)) {
          originEntry.linkedWordIds = originEntry.linkedWordIds.filter(
            (id) => id !== destinationId
          );
          changed = true;
        }
        if ((_b = destinationEntry == null ? void 0 : destinationEntry.linkedWordIds) == null ? void 0 : _b.includes(originId)) {
          destinationEntry.linkedWordIds = destinationEntry.linkedWordIds.filter(
            (id) => id !== originId
          );
          changed = true;
        }
        if (changed) {
          writeTranslations(dictionaryFilePath, translations);
        }
        removeLegacyGraphFileIfExists(legacyGraphFilePath);
        broadcastToAllWindows("graph-changed", { route, name });
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
        console.log(_config);
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
    if (typeof content !== "string" && typeof content !== "object") return null;
    return { role, content };
  }).filter((m) => Boolean(m));
}
function sendChat() {
  ipcMain.handle("chatSend", async (_event, rawMessages) => {
    const messages = coerceMessages(rawMessages);
    if (messages.length === 0) {
      throw new Error("No messages provided.");
    }
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${response.status}: ${text}`
      );
    }
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      throw new Error("Empty response from local API.");
    }
    return payload;
  });
}
function coerceLanguage(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
function registerSendConfigChat() {
  ipcMain.handle("chatConfig", async (_event, rawLanguage) => {
    const language = coerceLanguage(rawLanguage);
    if (!language) {
      throw new Error("A dictionary language is required.");
    }
    const messages = [
      {
        role: "user",
        content: {
          prompt: `Generate dictionary configuration for the language: "${language}".`,
          details: "Return JSON only. All labels must be in the target language's autonym, never the label language. For articles: provide non-empty definite article for each gender × number pair.",
          context: {
            requestedLanguageLabel: language
          }
        }
      }
    ];
    const response = await fetch("http://localhost:3000/api/chat/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${response.status}: ${text}`
      );
    }
    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      throw new Error("Empty response from local API.");
    }
    return payload;
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
  registerSendConfigChat();
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
