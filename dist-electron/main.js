import { BrowserWindow as E, Menu as V, ipcMain as c, app as F, dialog as H } from "electron";
import { fileURLToPath as B } from "node:url";
import l from "node:path";
import h from "path";
import a from "fs";
import { randomFillSync as Z, randomUUID as q } from "node:crypto";
import g, { promises as w } from "node:fs";
const J = l.dirname(B(import.meta.url));
process.env.APP_ROOT = l.join(J, "..");
const D = process.env.VITE_DEV_SERVER_URL;
l.join(process.env.APP_ROOT, "dist-electron");
const A = l.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = D ? l.join(process.env.APP_ROOT, "public") : A;
function R(e, r) {
  const o = new E({
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
      preload: l.join(J, "preload.mjs"),
      zoomFactor: 1
    }
  });
  o.webContents.setVisualZoomLevelLimits(1, 5), o.webContents.openDevTools(), V.setApplicationMenu(null), o.webContents.on("did-finish-load", () => {
    o == null || o.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), o.webContents.on("before-input-event", (n, s) => {
    if (s.control)
      if (s.key === "+") {
        const i = o.webContents.getZoomFactor();
        o.webContents.setZoomFactor(Math.min(i + 0.1, 5)), n.preventDefault();
      } else if (s.key === "-") {
        const i = o.webContents.getZoomFactor();
        o.webContents.setZoomFactor(Math.max(i - 0.1, 0.5)), n.preventDefault();
      } else s.key === "0" && (o.webContents.setZoomFactor(1), n.preventDefault());
  });
  const t = typeof (r == null ? void 0 : r.hideSidebar) == "boolean" ? `?hideSidebar=${r.hideSidebar ? "1" : "0"}` : "";
  if (D) {
    const n = e ? `#${encodeURIComponent(e)}` : "";
    o.loadURL(`${D}${t}${n}`);
  } else
    o.loadFile(l.join(A, "index.html"), {
      hash: e ? encodeURIComponent(e) : void 0,
      search: t || void 0
    });
}
function K() {
  c.handle("fetchConjugation", async (e, r, o, t) => {
    try {
      const n = h.join(r, `CONJ-${o}.json`);
      console.log("Fetching conjugation from", n, t), a.existsSync(n) || a.writeFileSync(n, "{}", "utf-8");
      const s = a.readFileSync(n, "utf-8");
      return JSON.parse(s)[t] || {};
    } catch (n) {
      throw console.error("Error reading JSON file:", n), new Error("Failed to load JSON file.");
    }
  });
}
function X() {
  c.handle("saveConjugation", async (e, r, o, t, n) => {
    try {
      const s = h.join(r, `CONJ-${o}.json`);
      console.log("Saving conjugation to", s, "for uuid:", t);
      let i = {};
      if (a.existsSync(s)) {
        const u = a.readFileSync(s, "utf-8");
        i = JSON.parse(u);
      }
      return i[t] = n, a.writeFileSync(s, JSON.stringify(i, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (s) {
      throw console.error("Error saving conjugation:", s), new Error("Failed to save conjugation.");
    }
  });
}
function Y() {
  c.handle("fetchMarkdown", async (e, r, o, t) => {
    try {
      const n = r.replace(/\\/g, "/"), s = h.join(
        n,
        `MD-${o}`,
        `${t}.json`
      );
      if (!a.existsSync(s))
        return { type: "doc", content: [] };
      const i = a.readFileSync(s, "utf-8");
      try {
        return JSON.parse(i);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (n) {
      throw console.error("Error reading markdown file:", n), new Error(`Failed to load markdown file: ${n}`);
    }
  });
}
function Q() {
  c.handle(
    "saveMarkdown",
    async (e, r, o, t, n) => {
      var s;
      try {
        const i = r.replace(/\\/g, "/"), u = h.join(
          i,
          `MD-${o}`,
          `${t}.json`
        ), d = h.dirname(u), f = n && n.type === "doc" && Array.isArray(n.content) && n.content.length === 1 && n.content[0].type === "paragraph" && ((s = n.content[0].attrs) == null ? void 0 : s.textAlign) === null && !n.content[0].content;
        return n === null || f ? (a.existsSync(u) && a.unlinkSync(u), { success: !0 }) : (a.mkdirSync(d, { recursive: !0 }), n === void 0 ? a.writeFileSync(u, "", "utf-8") : a.writeFileSync(u, JSON.stringify(n, null, 2), "utf-8"), { success: !0, path: u });
      } catch (i) {
        throw console.error("Error saving markdown file:", i), new Error(`Failed to save markdown file: ${i}`);
      }
    }
  );
}
const y = [];
for (let e = 0; e < 256; ++e)
  y.push((e + 256).toString(16).slice(1));
function ee(e, r = 0) {
  return (y[e[r + 0]] + y[e[r + 1]] + y[e[r + 2]] + y[e[r + 3]] + "-" + y[e[r + 4]] + y[e[r + 5]] + "-" + y[e[r + 6]] + y[e[r + 7]] + "-" + y[e[r + 8]] + y[e[r + 9]] + "-" + y[e[r + 10]] + y[e[r + 11]] + y[e[r + 12]] + y[e[r + 13]] + y[e[r + 14]] + y[e[r + 15]]).toLowerCase();
}
const N = new Uint8Array(256);
let O = N.length;
function re() {
  return O > N.length - 16 && (Z(N), O = 0), N.slice(O, O += 16);
}
const b = { randomUUID: q };
function ne(e, r, o) {
  var n;
  e = e || {};
  const t = e.random ?? ((n = e.rng) == null ? void 0 : n.call(e)) ?? re();
  if (t.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, ee(t);
}
function T(e, r, o) {
  return b.randomUUID && !e ? b.randomUUID() : ne(e);
}
function m(e, r) {
  for (const o of E.getAllWindows())
    o.isDestroyed() || o.webContents.send(e, r);
}
function te() {
  c.handle(
    "addTranslation",
    async (e, r, o, t, n) => {
      try {
        const s = h.join(t, `${n}.json`);
        if (!a.existsSync(s))
          throw new Error(`The file ${s} does not exist.`);
        const i = JSON.parse(a.readFileSync(s, "utf-8"));
        let u = Array.isArray(i) ? i : [];
        if (o)
          u = u.filter(
            (d) => d.uuid !== o
          );
        else {
          const d = r.uuid || T();
          r.uuid = d;
          const f = h.join(t, `GRAPH-${n}.json`);
          console.log("Saving graph to", f, "for uuid:", r.uuid);
          let p = {};
          a.existsSync(f) && (p = JSON.parse(a.readFileSync(f, "utf-8"))), p[d] = {}, a.writeFileSync(f, JSON.stringify(p, null, 2), "utf-8");
        }
        return u.push(r), a.writeFileSync(
          s,
          JSON.stringify(u, null, 2),
          "utf-8"
        ), m("app-data-changed"), { success: !0 };
      } catch (s) {
        throw console.error("Error adding translation:", s), new Error(`Failed to add translation. ${t}, ${s}`);
      }
    }
  );
}
const oe = "user-config.json", ie = "user-preferences.json", se = () => F.getPath("userData"), C = (e) => l.join(se(), e);
async function _(e) {
  await w.mkdir(l.dirname(e), { recursive: !0 });
}
async function U(e, r) {
  try {
    const o = await w.readFile(e, "utf-8");
    return JSON.parse(o);
  } catch (o) {
    if (typeof o == "object" && o !== null && "code" in o && o.code === "ENOENT")
      return await _(e), await w.writeFile(e, JSON.stringify(r, null, 2), "utf-8"), r;
    throw o;
  }
}
async function k(e, r) {
  await _(e);
  const o = `${e}.${process.pid}.${Date.now()}.tmp`;
  await w.writeFile(o, JSON.stringify(r, null, 2), "utf-8"), await w.rename(o, e);
}
const ae = {}, ce = {}, W = () => C(oe), I = () => C(ie);
async function j() {
  const e = W();
  return U(e, ae);
}
async function P(e) {
  return k(W(), e);
}
async function z() {
  const e = I();
  return U(e, ce);
}
async function le(e) {
  return k(I(), e);
}
function ue() {
  c.handle(
    "createDictionary",
    async (e, r, o) => {
      try {
        const t = T(), n = l.resolve(r, t), s = l.join(n, `${t}.json`), i = l.join(n, "MD-" + t), u = l.join(n, "NOTES-" + t);
        if (!g.existsSync(r))
          throw new Error(`The folder ${r} does not exist.`);
        g.existsSync(n) || g.mkdirSync(n, { recursive: !0 }), g.writeFileSync(s, JSON.stringify([], null, 2), "utf-8"), g.mkdirSync(i, { recursive: !0 }), g.mkdirSync(u, { recursive: !0 });
        const d = await j();
        return d.dictionaries || (d.dictionaries = {}), d.dictionaries[t] = {
          name: o,
          route: n,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, await P(d), m("app-data-changed"), {
          success: !0,
          folderName: t,
          folderPath: n
        };
      } catch (t) {
        throw console.error("❌ Error creating dictionary:", t), new Error("Failed to create dictionary.");
      }
    }
  );
}
function de() {
  c.handle(
    "deleteTranslation",
    async (e, r, o, t) => {
      try {
        const n = h.join(o, `${t}.json`);
        if (!a.existsSync(n))
          throw new Error(`The file ${n} does not exist.`);
        const s = a.readFileSync(n, "utf-8"), i = JSON.parse(s), d = (Array.isArray(i) ? i : []).filter((f) => f.uuid !== r);
        {
          const f = h.join(o, `GRAPH-${t}.json`);
          console.log(
            "Deleting graph entry from",
            f,
            "for uuid:",
            r
          );
          let p = {};
          a.existsSync(f) && (p = JSON.parse(a.readFileSync(f, "utf-8"))), p[r] && delete p[r], a.writeFileSync(f, JSON.stringify(p, null, 2), "utf-8"), console.log("Graph entry deleted successfully");
        }
        return a.writeFileSync(
          n,
          JSON.stringify(d, null, 2),
          "utf-8"
        ), m("app-data-changed"), { success: !0, message: "Translation added successfully." };
      } catch (n) {
        throw console.error("Error adding translation:", n), new Error(`Failed to delete translation. ${n}`);
      }
    }
  );
}
function fe(e) {
  g.existsSync(e) && g.rmSync(e, { recursive: !0, force: !0 });
}
function he() {
  c.handle(
    "deleteDictionary",
    async (e, r) => {
      try {
        const o = await j();
        if (!o.dictionaries || !o.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const t = o.dictionaries[r], n = l.resolve(t.route);
        if (!g.existsSync(n) || !g.statSync(n).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${n}`);
        return fe(n), delete o.dictionaries[r], await P(o), m("app-data-changed"), {
          success: !0,
          deletedId: r,
          deletedPath: n
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
    async (e, r, o) => {
      try {
        const t = await j();
        if (!t.dictionaries || !t.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        if (!o || o.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return t.dictionaries[r].name = o.trim(), await P(t), m("app-data-changed"), {
          success: !0,
          dictId: r,
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
      return await j();
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function pe() {
  c.handle("loadTranslations", async (e, r, o) => {
    try {
      const t = h.join(r, `${o}.json`);
      if (!a.existsSync(t))
        return [];
      const n = a.readFileSync(t, "utf-8"), s = JSON.parse(n || "[]");
      return Array.isArray(s) ? s : [];
    } catch (t) {
      return console.error("Error reading JSON file:", t), [];
    }
  });
}
async function G(e, r) {
  await w.mkdir(r, { recursive: !0 });
  const o = await w.readdir(e, { withFileTypes: !0 });
  for (const t of o) {
    const n = l.join(e, t.name), s = l.join(r, t.name);
    t.isDirectory() ? await G(n, s) : await w.copyFile(n, s);
  }
}
const ge = (e) => w.rm(e, { recursive: !0, force: !0 });
function me() {
  c.handle(
    "moveDictionary",
    async (e, r, o) => {
      try {
        const t = await j();
        if (!t.dictionaries || !t.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const s = t.dictionaries[r].route, i = l.resolve(s), u = l.resolve(o), d = await w.stat(i).catch(() => null);
        if (!(d != null && d.isDirectory()))
          throw new Error(`Source folder does not exist or is not a directory: ${i}`);
        const f = await w.stat(u).catch(() => null);
        if (!(f != null && f.isDirectory()))
          throw new Error(`Destination folder does not exist or is not a directory: ${u}`);
        const p = l.basename(i), v = l.join(u, p), M = (S, L) => {
          const $ = l.relative(S, L);
          return !!$ && !$.startsWith("..") && !l.isAbsolute($);
        };
        if (i === v)
          return { success: !0, oldRoute: i, newRoute: v };
        if (M(i, v))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (await w.stat(v).catch(() => null))
          throw new Error(
            `A folder named "${p}" already exists at the destination (${v}).`
          );
        let x = !1;
        try {
          await w.rename(i, v), x = !0;
        } catch (S) {
          if (typeof S == "object" && S !== null && "code" in S && S.code === "EXDEV")
            await G(i, v), await ge(i), x = !0;
          else
            throw S;
        }
        if (!x)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return t.dictionaries[r].route = v, await P(t), m("app-data-changed"), {
          success: !0,
          oldRoute: i,
          newRoute: v
        };
      } catch (t) {
        throw console.error("❌ Error moving dictionary:", t), new Error("Failed to move dictionary.");
      }
    }
  );
}
function ve() {
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
function Se() {
  c.handle("fetchGraph", async (e, r, o, t) => {
    try {
      const n = h.join(r, `GRAPH-${o}.json`);
      console.log("Fetching graph from", n, "for dictionary", o), a.existsSync(n) || a.writeFileSync(n, "{}", "utf-8");
      const s = a.readFileSync(n, "utf-8"), i = JSON.parse(s);
      return t ? i[t] || {} : i || {};
    } catch (n) {
      throw console.error("Error reading JSON file:", n), new Error("Failed to load JSON file.");
    }
  });
}
function Ee() {
  c.handle(
    "saveGraph",
    async (e, r, o, t, n) => {
      try {
        const s = h.join(r, `GRAPH-${o}.json`);
        let i = {};
        return a.existsSync(s) && (i = JSON.parse(a.readFileSync(s, "utf-8"))), i[t.uuid] || (i[t.uuid] = {}), i[n.uuid] || (i[n.uuid] = {}), i[t.uuid][n.uuid] = n.word, i[n.uuid][t.uuid] = t.word, a.writeFileSync(s, JSON.stringify(i, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error saving graph:", s), new Error("Failed to save graph.");
      }
    }
  );
}
function je() {
  c.handle(
    "deleteGraphEntry",
    async (e, r, o, t, n) => {
      try {
        const s = h.join(r, `GRAPH-${o}.json`);
        let i = {};
        return a.existsSync(s) && (i = JSON.parse(a.readFileSync(s, "utf-8"))), i[t.uuid] && delete i[t.uuid][n.uuid], i[n.uuid] && delete i[n.uuid][t.uuid], a.writeFileSync(s, JSON.stringify(i, null, 2), "utf-8"), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error deleting graph entry:", s), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function Fe() {
  c.handle(
    "saveUserPreferences",
    async (e, r) => {
      try {
        const t = { ...await z(), ...r };
        return await le(t), m("app-data-changed"), t;
      } catch (o) {
        throw console.error("Error saving user preferences file:", o), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function Pe() {
  c.handle("loadUserPreferences", async () => {
    try {
      return await z();
    } catch (e) {
      throw console.error("Error reading user preferences file:", e), new Error("Failed to load user preferences file.");
    }
  });
}
function Oe() {
  c.handle(
    "editConfig",
    async (e, r) => {
      try {
        const t = { ...await j(), ...r };
        return await P(t), m("app-data-changed"), t;
      } catch (o) {
        throw console.error("Error saving user preferences file:", o), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function Ne() {
  c.handle("fetchNoteIndex", async (e, r, o) => {
    try {
      const t = r.replace(/\\/g, "/"), n = h.join(
        t,
        `NOTES-${o}`,
        `NOTES-INDEX-${o}.json`
      );
      a.existsSync(n) || (a.mkdirSync(h.dirname(n), { recursive: !0 }), a.writeFileSync(n, JSON.stringify([], null, 2), "utf-8"));
      const s = a.readFileSync(n, "utf-8");
      return JSON.parse(s);
    } catch (t) {
      throw console.error("Error reading markdown file:", t), new Error(`Failed to load markdown file: ${t}`);
    }
  });
}
function xe() {
  c.handle(
    "saveNoteIndex",
    async (e, r, o, t) => {
      try {
        const n = r.replace(/\\/g, "/"), s = h.join(
          n,
          `NOTES-${o}`,
          `NOTES-INDEX-${o}.json`
        );
        return a.writeFileSync(s, JSON.stringify(t, null, 2), "utf-8"), m("notes-changed", {
          route: n,
          name: o
        }), { success: !0, path: s };
      } catch (n) {
        throw console.error("Error saving JSON file:", n), new Error(`Failed to save JSON file: ${n}`);
      }
    }
  );
}
function $e() {
  c.handle("saveNotes", async (e, r, o, t, n) => {
    try {
      if (typeof r != "string" || typeof o != "string")
        throw new Error("Invalid note route/name.");
      if (typeof t != "string" || !t.trim())
        return { success: !1, error: "Invalid note id." };
      const s = r.replace(/\\/g, "/"), i = h.join(
        s,
        `NOTES-${o}`,
        `${t}.json`
      ), u = h.dirname(i);
      a.mkdirSync(u, { recursive: !0 });
      const d = n && typeof n == "object" ? n : { type: "doc", content: [] };
      return a.writeFileSync(i, JSON.stringify(d, null, 2), "utf-8"), m("notes-changed", {
        route: s,
        name: o,
        uuid: t
      }), { success: !0, path: i };
    } catch (s) {
      throw console.error("Error saving markdown file:", s), new Error(`Failed to save markdown file: ${s}`);
    }
  });
}
function De() {
  c.handle("fetchNotes", async (e, r, o, t) => {
    try {
      const n = r.replace(/\\/g, "/"), s = h.join(
        n,
        `NOTES-${o}`,
        `${t}.json`
      );
      if (!a.existsSync(s))
        return { type: "doc", content: [] };
      const i = a.readFileSync(s, "utf-8");
      try {
        return JSON.parse(i);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (n) {
      return console.error("Error reading note file:", n), { type: "doc", content: [] };
    }
  });
}
function Re() {
  c.handle("window-minimize", () => {
    const e = E.getFocusedWindow();
    e == null || e.minimize();
  });
}
function be() {
  c.handle("window-maximize", () => {
    const e = E.getFocusedWindow();
    e && (e.isMaximized() ? e.unmaximize() : e.maximize());
  });
}
function Je() {
  c.handle("window-close", () => {
    const e = E.getFocusedWindow();
    e == null || e.close();
  });
}
function Ae(e) {
  if (typeof e != "string") return;
  const r = e.trim();
  if (r)
    return r.startsWith("/") ? r : `/${r}`;
}
function Te() {
  c.handle("window-open-new", (e, r) => {
    R(Ae(r), { hideSidebar: !0 });
  });
}
function Ce(e) {
  return Array.isArray(e) ? e.map((r) => {
    if (typeof r != "object" || r === null) return null;
    const o = "role" in r ? r.role : void 0, t = "content" in r ? r.content : void 0;
    if (o !== "user" && o !== "assistant" || typeof t != "string") return null;
    const n = t.trim();
    return n ? { role: o, content: n } : null;
  }).filter((r) => !!r) : [];
}
function _e(e) {
  if (typeof e.output_text == "string" && e.output_text.trim())
    return e.output_text.trim();
  for (const r of e.output ?? [])
    for (const o of r.content ?? [])
      if (typeof o.text == "string" && o.text.trim())
        return o.text.trim();
  return "";
}
function Ue() {
  c.handle("chatSend", async (e, r) => {
    var d;
    const o = process.env.OPENAI_API_KEY;
    if (!o)
      throw new Error(
        "Missing OPENAI_API_KEY. Set it in your environment (or a .env/.env.local file) before starting the app."
      );
    const t = Ce(r);
    if (t.length === 0)
      throw new Error("No messages provided.");
    const s = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${o}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          { role: "developer", content: "You are a helpful, concise assistant inside a vocabulary app. Answer in the user's language. Prefer short, actionable answers. If asked for vocabulary help, include examples and brief explanations." },
          ...t.map((f) => ({ role: f.role, content: f.content }))
        ]
      })
    }), i = await s.json().catch(() => null);
    if (!s.ok) {
      const f = ((d = i == null ? void 0 : i.error) == null ? void 0 : d.message) || `OpenAI request failed with status ${s.status}.`;
      throw new Error(f);
    }
    const u = i ? _e(i) : "";
    if (!u) throw new Error("Empty response from model.");
    return { text: u };
  });
}
function ke() {
  pe(), te(), de(), ue(), me(), he(), ye(), ve(), we(), Oe(), Y(), Q(), K(), X(), Se(), Ee(), je(), Fe(), Pe(), Ne(), xe(), $e(), De(), Ue(), Re(), be(), Je(), Te();
}
function We(e) {
  const r = {};
  for (const o of e.split(/\r?\n/)) {
    const t = o.trim();
    if (!t || t.startsWith("#")) continue;
    const n = t.indexOf("=");
    if (n <= 0) continue;
    const s = t.slice(0, n).trim();
    let i = t.slice(n + 1).trim();
    s && ((i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'")) && (i = i.slice(1, -1)), i && (r[s] = i));
  }
  return r;
}
async function Ie(e) {
  try {
    const r = await w.readFile(e, "utf-8");
    return We(r);
  } catch (r) {
    return typeof r == "object" && r !== null && "code" in r && r.code === "ENOENT", null;
  }
}
async function ze() {
  const e = [
    l.join(process.cwd(), ".env"),
    l.join(process.cwd(), ".env.local"),
    process.env.APP_ROOT ? l.join(process.env.APP_ROOT, ".env") : null,
    process.env.APP_ROOT ? l.join(process.env.APP_ROOT, ".env.local") : null
  ].filter((r) => !!r);
  for (const r of e) {
    const o = await Ie(r);
    if (o)
      for (const [t, n] of Object.entries(o))
        process.env[t] || (process.env[t] = n);
  }
}
F.on("window-all-closed", () => {
  process.platform !== "darwin" && F.quit();
});
F.on("activate", () => {
  E.getAllWindows().length === 0 && R();
});
F.whenReady().then(() => {
  ze(), ke(), R();
});
