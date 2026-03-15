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
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
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
    });
}
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
      }
    }
  );
}
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
        };
      } catch (t) {
        throw console.error("❌ Error creating dictionary:", t), new Error("Failed to create dictionary.");
      }
    }
  );
}
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
      }
    }
  );
}
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
        };
      } catch (t) {
        throw console.error("❌ Error moving dictionary:", t), new Error("Failed to move dictionary.");
      }
    }
  );
}
function Se() {
  c.handle("selectFolder", async () => {
    try {
      const e = await H.showOpenDialog({
        properties: ["openDirectory"]
      });
      return e.canceled ? null : e.filePaths[0];
    } catch (e) {
      throw console.error("Error selecting folder:", e), new Error("Failed to select folder.");
    }
  });
}
function ve() {
  c.handle("fetchGraph", async (e, n, o, t) => {
    try {
      const r = f.join(n, `GRAPH-${o}.json`);
      console.log("Fetching graph from", r, "for dictionary", o), s.existsSync(r) || s.writeFileSync(r, "{}", "utf-8");
      const i = s.readFileSync(r, "utf-8"), a = JSON.parse(i);
      return t ? a[t] || {} : a || {};
    } catch (r) {
      throw console.error("Error reading JSON file:", r), new Error("Failed to load JSON file.");
    }
  });
}
function Ee() {
  c.handle(
    "saveGraph",
    async (e, n, o, t, r) => {
      try {
        const i = f.join(n, `GRAPH-${o}.json`);
        let a = {};
        return s.existsSync(i) && (a = JSON.parse(s.readFileSync(i, "utf-8"))), a[t.uuid] || (a[t.uuid] = {}), a[r.uuid] || (a[r.uuid] = {}), a[t.uuid][r.uuid] = r.word, a[r.uuid][t.uuid] = t.word, s.writeFileSync(i, JSON.stringify(a, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (i) {
        throw console.error("Error saving graph:", i), new Error("Failed to save graph.");
      }
    }
  );
}
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
      }
    }
  );
}
function Ne() {
  c.handle("loadUserPreferences", async () => {
    try {
      return await z();
    } catch (e) {
      throw console.error("Error reading user preferences file:", e), new Error("Failed to load user preferences file.");
    }
  });
}
function Pe() {
  c.handle(
    "editConfig",
    async (e, n) => {
      try {
        const t = { ...await F(), ...n };
        return await N(t), p("app-data-changed"), t;
      } catch (o) {
        throw console.error("Error saving user preferences file:", o), new Error("Failed to save user preferences file.");
      }
    }
  );
}
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
      }
    }
  );
}
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
});
