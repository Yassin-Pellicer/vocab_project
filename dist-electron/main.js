<<<<<<< HEAD
import { BrowserWindow as E, Menu as V, ipcMain as c, app as j, dialog as H } from "electron";
import { fileURLToPath as Z } from "node:url";
import d from "node:path";
import f from "path";
import s from "fs";
import { randomFillSync as B, randomUUID as X } from "node:crypto";
import m, { promises as w } from "node:fs";
const C = d.dirname(Z(import.meta.url));
process.env.APP_ROOT = d.join(C, "..");
const x = process.env.VITE_DEV_SERVER_URL;
d.join(process.env.APP_ROOT, "dist-electron");
const b = d.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = x ? d.join(process.env.APP_ROOT, "public") : b;
function J(e, n) {
  const o = new E({
=======
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
>>>>>>> dd30e28 (config done)
    width: 1200,
    height: 800,
    frame: true,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: false,
    webPreferences: {
<<<<<<< HEAD
      preload: d.join(C, "preload.mjs"),
      zoomFactor: 1
    }
  });
  o.webContents.setVisualZoomLevelLimits(1, 5), o.webContents.openDevTools(), V.setApplicationMenu(null), o.webContents.on("did-finish-load", () => {
    o == null || o.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), o.webContents.on("before-input-event", (r, i) => {
    if (i.control)
      if (i.key === "+") {
        const a = o.webContents.getZoomFactor();
        o.webContents.setZoomFactor(Math.min(a + 0.1, 5)), r.preventDefault();
      } else if (i.key === "-") {
        const a = o.webContents.getZoomFactor();
        o.webContents.setZoomFactor(Math.max(a - 0.1, 0.5)), r.preventDefault();
      } else i.key === "0" && (o.webContents.setZoomFactor(1), r.preventDefault());
  });
  const t = typeof (n == null ? void 0 : n.hideSidebar) == "boolean" ? `?hideSidebar=${n.hideSidebar ? "1" : "0"}` : "";
  if (x) {
    const r = e ? `#${encodeURIComponent(e)}` : "";
    o.loadURL(`${x}${t}${r}`);
  } else
    o.loadFile(d.join(b, "index.html"), {
      hash: e ? encodeURIComponent(e) : void 0,
      search: t || void 0
=======
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
>>>>>>> dd30e28 (config done)
    });
  }
}
<<<<<<< HEAD
function q() {
  c.handle("fetchConjugation", async (e, n, o, t) => {
    try {
      const r = f.join(n, `CONJ-${o}.json`);
      console.log("Fetching conjugation from", r, t), s.existsSync(r) || s.writeFileSync(r, "{}", "utf-8");
      const i = s.readFileSync(r, "utf-8");
      return JSON.parse(i)[t] || {};
    } catch (r) {
      throw console.error("Error reading JSON file:", r), new Error("Failed to load JSON file.");
    }
  });
}
function K() {
  c.handle("saveConjugation", async (e, n, o, t, r) => {
    try {
      const i = f.join(n, `CONJ-${o}.json`);
      console.log("Saving conjugation to", i, "for uuid:", t);
      let a = {};
      if (s.existsSync(i)) {
        const l = s.readFileSync(i, "utf-8");
        a = JSON.parse(l);
      }
      return a[t] = r, s.writeFileSync(i, JSON.stringify(a, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (i) {
      throw console.error("Error saving conjugation:", i), new Error("Failed to save conjugation.");
    }
  });
}
function Q() {
  c.handle("fetchMarkdown", async (e, n, o, t) => {
    try {
      const r = n.replace(/\\/g, "/"), i = f.join(
        r,
        `MD-${o}`,
        `${t}.json`
      );
      if (!s.existsSync(i))
        return { type: "doc", content: [] };
      const a = s.readFileSync(i, "utf-8");
      try {
        return JSON.parse(a);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (r) {
      throw console.error("Error reading markdown file:", r), new Error(`Failed to load markdown file: ${r}`);
    }
  });
}
function Y() {
  c.handle(
    "saveMarkdown",
    async (e, n, o, t, r) => {
      var i;
      try {
        const a = n.replace(/\\/g, "/"), l = f.join(
          a,
          `MD-${o}`,
          `${t}.json`
        ), u = f.dirname(l), h = r && r.type === "doc" && Array.isArray(r.content) && r.content.length === 1 && r.content[0].type === "paragraph" && ((i = r.content[0].attrs) == null ? void 0 : i.textAlign) === null && !r.content[0].content;
        return r === null || h ? (s.existsSync(l) && s.unlinkSync(l), { success: !0 }) : (s.mkdirSync(u, { recursive: !0 }), r === void 0 ? s.writeFileSync(l, "", "utf-8") : s.writeFileSync(l, JSON.stringify(r, null, 2), "utf-8"), { success: !0, path: l });
      } catch (a) {
        throw console.error("Error saving markdown file:", a), new Error(`Failed to save markdown file: ${a}`);
      }
    }
  );
}
const y = [];
for (let e = 0; e < 256; ++e)
  y.push((e + 256).toString(16).slice(1));
function ee(e, n = 0) {
  return (y[e[n + 0]] + y[e[n + 1]] + y[e[n + 2]] + y[e[n + 3]] + "-" + y[e[n + 4]] + y[e[n + 5]] + "-" + y[e[n + 6]] + y[e[n + 7]] + "-" + y[e[n + 8]] + y[e[n + 9]] + "-" + y[e[n + 10]] + y[e[n + 11]] + y[e[n + 12]] + y[e[n + 13]] + y[e[n + 14]] + y[e[n + 15]]).toLowerCase();
}
const O = new Uint8Array(256);
let P = O.length;
function re() {
  return P > O.length - 16 && (B(O), P = 0), O.slice(P, P += 16);
}
const R = { randomUUID: X };
function ne(e, n, o) {
  var r;
  e = e || {};
  const t = e.random ?? ((r = e.rng) == null ? void 0 : r.call(e)) ?? re();
  if (t.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, ee(t);
}
function T(e, n, o) {
  return R.randomUUID && !e ? R.randomUUID() : ne(e);
}
function p(e, n) {
  for (const o of E.getAllWindows())
    o.isDestroyed() || o.webContents.send(e, n);
}
function te() {
  c.handle(
    "addTranslation",
    async (e, n, o, t, r) => {
      try {
        const i = f.join(t, `${r}.json`);
        if (!s.existsSync(i))
          throw new Error(`The file ${i} does not exist.`);
        const a = JSON.parse(s.readFileSync(i, "utf-8"));
        let l = Array.isArray(a) ? a : [];
        if (o)
          l = l.filter(
            (u) => u.uuid !== o
          );
        else {
          const u = n.uuid || T();
          n.uuid = u;
          const h = f.join(t, `GRAPH-${r}.json`);
          console.log("Saving graph to", h, "for uuid:", n.uuid);
          let g = {};
          s.existsSync(h) && (g = JSON.parse(s.readFileSync(h, "utf-8"))), g[u] = {}, s.writeFileSync(h, JSON.stringify(g, null, 2), "utf-8");
        }
        return l.push(n), s.writeFileSync(
          i,
          JSON.stringify(l, null, 2),
          "utf-8"
        ), p("app-data-changed"), { success: !0 };
      } catch (i) {
        throw console.error("Error adding translation:", i), new Error(`Failed to add translation. ${t}, ${i}`);
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
const oe = "user-config.json", ie = "user-preferences.json", ae = () => j.getPath("userData"), U = (e) => d.join(ae(), e);
async function A(e) {
  await w.mkdir(d.dirname(e), { recursive: !0 });
}
async function k(e, n) {
  try {
    const o = await w.readFile(e, "utf-8");
    return JSON.parse(o);
  } catch (o) {
    if (typeof o == "object" && o !== null && "code" in o && o.code === "ENOENT")
      return await A(e), await w.writeFile(e, JSON.stringify(n, null, 2), "utf-8"), n;
    throw o;
  }
}
async function _(e, n) {
  await A(e);
  const o = `${e}.${process.pid}.${Date.now()}.tmp`;
  await w.writeFile(o, JSON.stringify(n, null, 2), "utf-8"), await w.rename(o, e);
}
const se = {}, ce = {}, W = () => U(oe), G = () => U(ie);
async function F() {
  const e = W();
  return k(e, se);
}
async function N(e) {
  return _(W(), e);
}
async function z() {
  const e = G();
  return k(e, ce);
}
async function le(e) {
  return _(G(), e);
}
function de() {
  c.handle(
    "createDictionary",
    async (e, n, o) => {
      try {
        const t = T(), r = d.resolve(n, t), i = d.join(r, `${t}.json`), a = d.join(r, "MD-" + t), l = d.join(r, "NOTES-" + t);
        if (!m.existsSync(n))
          throw new Error(`The folder ${n} does not exist.`);
        m.existsSync(r) || m.mkdirSync(r, { recursive: !0 }), m.writeFileSync(i, JSON.stringify([], null, 2), "utf-8"), m.mkdirSync(a, { recursive: !0 }), m.mkdirSync(l, { recursive: !0 });
        const u = await F();
        return u.dictionaries || (u.dictionaries = {}), u.dictionaries[t] = {
          name: o,
          route: r,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, await N(u), p("app-data-changed"), {
          success: !0,
          folderName: t,
          folderPath: r
=======
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
>>>>>>> dd30e28 (config done)
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
<<<<<<< HEAD
function ue() {
  c.handle(
    "deleteTranslation",
    async (e, n, o, t) => {
      try {
        const r = f.join(o, `${t}.json`);
        if (!s.existsSync(r))
          throw new Error(`The file ${r} does not exist.`);
        const i = s.readFileSync(r, "utf-8"), a = JSON.parse(i), u = (Array.isArray(a) ? a : []).filter((h) => h.uuid !== n);
        {
          const h = f.join(o, `GRAPH-${t}.json`);
          console.log(
            "Deleting graph entry from",
            h,
            "for uuid:",
            n
          );
          let g = {};
          s.existsSync(h) && (g = JSON.parse(s.readFileSync(h, "utf-8"))), g[n] && delete g[n], s.writeFileSync(h, JSON.stringify(g, null, 2), "utf-8"), console.log("Graph entry deleted successfully");
        }
        return s.writeFileSync(
          r,
          JSON.stringify(u, null, 2),
          "utf-8"
        ), p("app-data-changed"), { success: !0, message: "Translation added successfully." };
      } catch (r) {
        throw console.error("Error adding translation:", r), new Error(`Failed to delete translation. ${r}`);
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
function fe(e) {
  m.existsSync(e) && m.rmSync(e, { recursive: !0, force: !0 });
}
function he() {
  c.handle(
    "deleteDictionary",
    async (e, n) => {
      try {
        const o = await F();
        if (!o.dictionaries || !o.dictionaries[n])
          throw new Error(`Dictionary with id "${n}" not found in config.`);
        const t = o.dictionaries[n], r = d.resolve(t.route);
        if (!m.existsSync(r) || !m.statSync(r).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${r}`);
        return fe(r), delete o.dictionaries[n], await N(o), p("app-data-changed"), {
          success: !0,
          deletedId: n,
          deletedPath: r
        };
      } catch (o) {
        throw console.error("❌ Error deleting dictionary:", o), new Error("Failed to delete dictionary.");
      }
    }
  );
}
function ye() {
  c.handle(
    "renameDictionary",
    async (e, n, o) => {
      try {
        const t = await F();
        if (!t.dictionaries || !t.dictionaries[n])
          throw new Error(`Dictionary with id "${n}" not found in config.`);
        if (!o || o.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return t.dictionaries[n].name = o.trim(), await N(t), p("app-data-changed"), {
          success: !0,
          dictId: n,
          newName: o.trim()
        };
      } catch (t) {
        throw console.error("❌ Error renaming dictionary:", t), new Error("Failed to rename dictionary.");
      }
    }
  );
}
function we() {
  c.handle("loadConfig", async () => {
    try {
      return await F();
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function ge() {
  c.handle("loadTranslations", async (e, n, o) => {
    try {
      const t = f.join(n, `${o}.json`);
      if (!s.existsSync(t))
        return [];
      const r = s.readFileSync(t, "utf-8"), i = JSON.parse(r || "[]");
      return Array.isArray(i) ? i : [];
    } catch (t) {
      return console.error("Error reading JSON file:", t), [];
    }
  });
}
async function M(e, n) {
  await w.mkdir(n, { recursive: !0 });
  const o = await w.readdir(e, { withFileTypes: !0 });
  for (const t of o) {
    const r = d.join(e, t.name), i = d.join(n, t.name);
    t.isDirectory() ? await M(r, i) : await w.copyFile(r, i);
  }
}
const me = (e) => w.rm(e, { recursive: !0, force: !0 });
function pe() {
  c.handle(
    "moveDictionary",
    async (e, n, o) => {
      try {
        const t = await F();
        if (!t.dictionaries || !t.dictionaries[n])
          throw new Error(`Dictionary with id "${n}" not found in config.`);
        const i = t.dictionaries[n].route, a = d.resolve(i), l = d.resolve(o), u = await w.stat(a).catch(() => null);
        if (!(u != null && u.isDirectory()))
          throw new Error(`Source folder does not exist or is not a directory: ${a}`);
        const h = await w.stat(l).catch(() => null);
        if (!(h != null && h.isDirectory()))
          throw new Error(`Destination folder does not exist or is not a directory: ${l}`);
        const g = d.basename(a), S = d.join(l, g), I = (v, L) => {
          const D = d.relative(v, L);
          return !!D && !D.startsWith("..") && !d.isAbsolute(D);
        };
        if (a === S)
          return { success: !0, oldRoute: a, newRoute: S };
        if (I(a, S))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (await w.stat(S).catch(() => null))
          throw new Error(
            `A folder named "${g}" already exists at the destination (${S}).`
          );
        let $ = !1;
        try {
          await w.rename(a, S), $ = !0;
        } catch (v) {
          if (typeof v == "object" && v !== null && "code" in v && v.code === "EXDEV")
            await M(a, S), await me(a), $ = !0;
          else
            throw v;
        }
        if (!$)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return t.dictionaries[n].route = S, await N(t), p("app-data-changed"), {
          success: !0,
          oldRoute: a,
          newRoute: S
=======
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
>>>>>>> dd30e28 (config done)
        };
      } catch (error) {
        console.error("❌ Error deleting dictionary:", error);
        throw new Error("Failed to delete dictionary.");
      }
    }
  );
}
<<<<<<< HEAD
function Se() {
  c.handle("selectFolder", async () => {
=======
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
>>>>>>> dd30e28 (config done)
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
<<<<<<< HEAD
function ve() {
  c.handle("fetchGraph", async (e, n, o, t) => {
    try {
      const r = f.join(n, `GRAPH-${o}.json`);
      console.log("Fetching graph from", r, "for dictionary", o), s.existsSync(r) || s.writeFileSync(r, "{}", "utf-8");
      const i = s.readFileSync(r, "utf-8"), a = JSON.parse(i);
      return t ? a[t] || {} : a || {};
    } catch (r) {
      throw console.error("Error reading JSON file:", r), new Error("Failed to load JSON file.");
=======
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
>>>>>>> dd30e28 (config done)
    }
  });
}
function saveGraph() {
  ipcMain.handle(
    "saveGraph",
<<<<<<< HEAD
    async (e, n, o, t, r) => {
      try {
        const i = f.join(n, `GRAPH-${o}.json`);
        let a = {};
        return s.existsSync(i) && (a = JSON.parse(s.readFileSync(i, "utf-8"))), a[t.uuid] || (a[t.uuid] = {}), a[r.uuid] || (a[r.uuid] = {}), a[t.uuid][r.uuid] = r.word, a[r.uuid][t.uuid] = t.word, s.writeFileSync(i, JSON.stringify(a, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (i) {
        throw console.error("Error saving graph:", i), new Error("Failed to save graph.");
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
function Fe() {
  c.handle(
    "deleteGraphEntry",
    async (e, n, o, t, r) => {
      try {
        const i = f.join(n, `GRAPH-${o}.json`);
        let a = {};
        return s.existsSync(i) && (a = JSON.parse(s.readFileSync(i, "utf-8"))), a[t.uuid] && delete a[t.uuid][r.uuid], a[r.uuid] && delete a[r.uuid][t.uuid], s.writeFileSync(i, JSON.stringify(a, null, 2), "utf-8"), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (i) {
        throw console.error("Error deleting graph entry:", i), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function je() {
  c.handle(
    "saveUserPreferences",
    async (e, n) => {
      try {
        const t = { ...await z(), ...n };
        return await le(t), p("app-data-changed"), t;
      } catch (o) {
        throw console.error("Error saving user preferences file:", o), new Error("Failed to save user preferences file.");
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
function Ne() {
  c.handle("loadUserPreferences", async () => {
=======
function loadUserPreferences() {
  ipcMain.handle("loadUserPreferences", async () => {
>>>>>>> dd30e28 (config done)
    try {
      return await readUserPreferences();
    } catch (error) {
      console.error("Error reading user preferences file:", error);
      throw new Error("Failed to load user preferences file.");
    }
  });
}
<<<<<<< HEAD
function Pe() {
  c.handle(
    "editConfig",
    async (e, n) => {
      try {
        const t = { ...await F(), ...n };
        return await N(t), p("app-data-changed"), t;
      } catch (o) {
        throw console.error("Error saving user preferences file:", o), new Error("Failed to save user preferences file.");
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
function Oe() {
  c.handle("fetchNoteIndex", async (e, n, o) => {
    try {
      const t = n.replace(/\\/g, "/"), r = f.join(
        t,
        `NOTES-${o}`,
        `NOTES-INDEX-${o}.json`
      );
      s.existsSync(r) || (s.mkdirSync(f.dirname(r), { recursive: !0 }), s.writeFileSync(r, JSON.stringify([], null, 2), "utf-8"));
      const i = s.readFileSync(r, "utf-8");
      return JSON.parse(i);
    } catch (t) {
      throw console.error("Error reading markdown file:", t), new Error(`Failed to load markdown file: ${t}`);
    }
  });
}
function $e() {
  c.handle(
    "saveNoteIndex",
    async (e, n, o, t) => {
      try {
        const r = n.replace(/\\/g, "/"), i = f.join(
          r,
          `NOTES-${o}`,
          `NOTES-INDEX-${o}.json`
        );
        return s.writeFileSync(i, JSON.stringify(t, null, 2), "utf-8"), p("notes-changed", {
          route: r,
          name: o
        }), { success: !0, path: i };
      } catch (r) {
        throw console.error("Error saving JSON file:", r), new Error(`Failed to save JSON file: ${r}`);
=======
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
>>>>>>> dd30e28 (config done)
      }
    }
  );
}
<<<<<<< HEAD
function De() {
  c.handle("saveNotes", async (e, n, o, t, r) => {
    try {
      if (typeof n != "string" || typeof o != "string")
        throw new Error("Invalid note route/name.");
      if (typeof t != "string" || !t.trim())
        return { success: !1, error: "Invalid note id." };
      const i = n.replace(/\\/g, "/"), a = f.join(
        i,
        `NOTES-${o}`,
        `${t}.json`
      ), l = f.dirname(a);
      s.mkdirSync(l, { recursive: !0 });
      const u = r && typeof r == "object" ? r : { type: "doc", content: [] };
      return s.writeFileSync(a, JSON.stringify(u, null, 2), "utf-8"), p("notes-changed", {
        route: i,
        name: o,
        uuid: t
      }), { success: !0, path: a };
    } catch (i) {
      throw console.error("Error saving markdown file:", i), new Error(`Failed to save markdown file: ${i}`);
    }
  });
}
function xe() {
  c.handle("fetchNotes", async (e, n, o, t) => {
    try {
      const r = n.replace(/\\/g, "/"), i = f.join(
        r,
        `NOTES-${o}`,
        `${t}.json`
      );
      if (!s.existsSync(i))
        return { type: "doc", content: [] };
      const a = s.readFileSync(i, "utf-8");
      try {
        return JSON.parse(a);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (r) {
      return console.error("Error reading note file:", r), { type: "doc", content: [] };
    }
  });
}
function Je() {
  c.handle("window-minimize", () => {
    const e = E.getFocusedWindow();
    e == null || e.minimize();
  });
}
function Re() {
  c.handle("window-maximize", () => {
    const e = E.getFocusedWindow();
    e && (e.isMaximized() ? e.unmaximize() : e.maximize());
  });
}
function Ce() {
  c.handle("window-close", () => {
    const e = E.getFocusedWindow();
    e == null || e.close();
  });
}
function be(e) {
  if (typeof e != "string") return;
  const n = e.trim();
  if (n)
    return n.startsWith("/") ? n : `/${n}`;
}
function Te() {
  c.handle("window-open-new", (e, n) => {
    J(be(n), { hideSidebar: !0 });
  });
}
function Ue() {
  ge(), te(), ue(), de(), pe(), he(), ye(), Se(), we(), Pe(), Q(), Y(), q(), K(), ve(), Ee(), Fe(), je(), Ne(), Oe(), $e(), De(), xe(), Je(), Re(), Ce(), Te();
}
j.on("window-all-closed", () => {
  process.platform !== "darwin" && j.quit();
});
j.on("activate", () => {
  E.getAllWindows().length === 0 && J();
});
j.whenReady().then(() => {
  Ue(), J();
=======
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
>>>>>>> dd30e28 (config done)
});
