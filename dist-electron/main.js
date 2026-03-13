import { BrowserWindow as g, Menu as b, ipcMain as d, dialog as T, app as j } from "electron";
import { fileURLToPath as A } from "node:url";
import w from "node:path";
import a from "path";
import n from "fs";
import { randomFillSync as C, randomUUID as k } from "node:crypto";
const x = w.dirname(A(import.meta.url));
process.env.APP_ROOT = w.join(x, "..");
const F = process.env.VITE_DEV_SERVER_URL;
w.join(process.env.APP_ROOT, "dist-electron");
const J = w.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = F ? w.join(process.env.APP_ROOT, "public") : J;
function P(o, r) {
  const t = new g({
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
      preload: w.join(x, "preload.mjs"),
      zoomFactor: 1
    }
  });
  t.webContents.setVisualZoomLevelLimits(1, 5), t.webContents.openDevTools(), b.setApplicationMenu(null), t.webContents.on("did-finish-load", () => {
    t == null || t.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), t.webContents.on("before-input-event", (e, s) => {
    if (s.control)
      if (s.key === "+") {
        const c = t.webContents.getZoomFactor();
        t.webContents.setZoomFactor(Math.min(c + 0.1, 5)), e.preventDefault();
      } else if (s.key === "-") {
        const c = t.webContents.getZoomFactor();
        t.webContents.setZoomFactor(Math.max(c - 0.1, 0.5)), e.preventDefault();
      } else s.key === "0" && (t.webContents.setZoomFactor(1), e.preventDefault());
  });
  const i = typeof (r == null ? void 0 : r.hideSidebar) == "boolean" ? `?hideSidebar=${r.hideSidebar ? "1" : "0"}` : "";
  if (F) {
    const e = o ? `#${encodeURIComponent(o)}` : "";
    t.loadURL(`${F}${i}${e}`);
  } else
    t.loadFile(w.join(J, "index.html"), {
      hash: o ? encodeURIComponent(o) : void 0,
      search: i || void 0
    });
}
function U() {
  d.handle("fetchConjugation", async (o, r, t, i) => {
    try {
      const e = a.join(r, `CONJ-${t}.json`);
      console.log("Fetching conjugation from", e, i), n.existsSync(e) || n.writeFileSync(e, "{}", "utf-8");
      const s = n.readFileSync(e, "utf-8");
      return JSON.parse(s)[i] || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function W() {
  d.handle("saveConjugation", async (o, r, t, i, e) => {
    try {
      const s = a.join(r, `CONJ-${t}.json`);
      console.log("Saving conjugation to", s, "for uuid:", i);
      let c = {};
      if (n.existsSync(s)) {
        const l = n.readFileSync(s, "utf-8");
        c = JSON.parse(l);
      }
      return c[i] = e, n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (s) {
      throw console.error("Error saving conjugation:", s), new Error("Failed to save conjugation.");
    }
  });
}
function z() {
  d.handle("fetchMarkdown", async (o, r, t, i) => {
    try {
      const e = r.replace(/\\/g, "/"), s = a.join(
        e,
        `MD-${t}`,
        `${i}.json`
      );
      if (!n.existsSync(s))
        return { type: "doc", content: [] };
      const c = n.readFileSync(s, "utf-8");
      try {
        return JSON.parse(c);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (e) {
      throw console.error("Error reading markdown file:", e), new Error(`Failed to load markdown file: ${e}`);
    }
  });
}
function G() {
  d.handle(
    "saveMarkdown",
    async (o, r, t, i, e) => {
      var s;
      try {
        const c = r.replace(/\\/g, "/"), l = a.join(
          c,
          `MD-${t}`,
          `${i}.json`
        ), u = a.dirname(l), f = e && e.type === "doc" && Array.isArray(e.content) && e.content.length === 1 && e.content[0].type === "paragraph" && ((s = e.content[0].attrs) == null ? void 0 : s.textAlign) === null && !e.content[0].content;
        return e === null || f ? (n.existsSync(l) && n.unlinkSync(l), { success: !0 }) : (n.mkdirSync(u, { recursive: !0 }), e === void 0 ? n.writeFileSync(l, "", "utf-8") : n.writeFileSync(l, JSON.stringify(e, null, 2), "utf-8"), { success: !0, path: l });
      } catch (c) {
        throw console.error("Error saving markdown file:", c), new Error(`Failed to save markdown file: ${c}`);
      }
    }
  );
}
const y = [];
for (let o = 0; o < 256; ++o)
  y.push((o + 256).toString(16).slice(1));
function M(o, r = 0) {
  return (y[o[r + 0]] + y[o[r + 1]] + y[o[r + 2]] + y[o[r + 3]] + "-" + y[o[r + 4]] + y[o[r + 5]] + "-" + y[o[r + 6]] + y[o[r + 7]] + "-" + y[o[r + 8]] + y[o[r + 9]] + "-" + y[o[r + 10]] + y[o[r + 11]] + y[o[r + 12]] + y[o[r + 13]] + y[o[r + 14]] + y[o[r + 15]]).toLowerCase();
}
const v = new Uint8Array(256);
let m = v.length;
function I() {
  return m > v.length - 16 && (C(v), m = 0), v.slice(m, m += 16);
}
const N = { randomUUID: k };
function L(o, r, t) {
  var e;
  o = o || {};
  const i = o.random ?? ((e = o.rng) == null ? void 0 : e.call(o)) ?? I();
  if (i.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return i[6] = i[6] & 15 | 64, i[8] = i[8] & 63 | 128, M(i);
}
function $(o, r, t) {
  return N.randomUUID && !o ? N.randomUUID() : L(o);
}
function S(o, r) {
  for (const t of g.getAllWindows())
    t.isDestroyed() || t.webContents.send(o, r);
}
function V() {
  d.handle(
    "addTranslation",
    async (o, r, t, i, e) => {
      try {
        const s = a.join(i, `${e}.json`);
        if (!n.existsSync(s))
          throw new Error(`The file ${s} does not exist.`);
        const c = JSON.parse(n.readFileSync(s, "utf-8"));
        let l = Array.isArray(c) ? c : [];
        if (t)
          l = l.filter(
            (u) => u.uuid !== t
          );
        else {
          const u = r.uuid || $();
          r.uuid = u;
          const f = a.join(i, `GRAPH-${e}.json`);
          console.log("Saving graph to", f, "for uuid:", r.uuid);
          let h = {};
          n.existsSync(f) && (h = JSON.parse(n.readFileSync(f, "utf-8"))), h[u] = {}, n.writeFileSync(f, JSON.stringify(h, null, 2), "utf-8");
        }
        return l.push(r), n.writeFileSync(
          s,
          JSON.stringify(l, null, 2),
          "utf-8"
        ), S("app-data-changed"), { success: !0 };
      } catch (s) {
        throw console.error("Error adding translation:", s), new Error(`Failed to add translation. ${i}, ${s}`);
      }
    }
  );
}
function H() {
  d.handle(
    "createDictionary",
    async (o, r, t) => {
      try {
        const i = $(), e = a.resolve(r, i), s = a.join(e, `${i}.json`), c = a.join(e, "MD-" + i), l = a.join(e, "NOTES-" + i);
        if (!n.existsSync(r))
          throw new Error(`The folder ${r} does not exist.`);
        n.existsSync(e) || n.mkdirSync(e, { recursive: !0 }), n.writeFileSync(s, JSON.stringify([], null, 2), "utf-8"), n.mkdirSync(c, { recursive: !0 }), n.mkdirSync(l, { recursive: !0 });
        const u = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        n.existsSync(u) || n.writeFileSync(u, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        const f = JSON.parse(n.readFileSync(u, "utf-8"));
        return f.dictionaries || (f.dictionaries = {}), f.dictionaries[i] = {
          name: t,
          route: e,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, n.writeFileSync(u, JSON.stringify(f, null, 2), "utf-8"), S("app-data-changed"), {
          success: !0,
          folderName: i,
          folderPath: e
        };
      } catch (i) {
        throw console.error("❌ Error creating dictionary:", i), new Error("Failed to create dictionary.");
      }
    }
  );
}
function Z() {
  d.handle(
    "deleteTranslation",
    async (o, r, t, i) => {
      try {
        const e = a.join(t, `${i}.json`);
        if (!n.existsSync(e))
          throw new Error(`The file ${e} does not exist.`);
        const s = n.readFileSync(e, "utf-8"), c = JSON.parse(s);
        let l = Array.isArray(c) ? c : [];
        l = l.filter((u) => u.uuid !== r);
        {
          const u = a.join(t, `GRAPH-${i}.json`);
          console.log(
            "Deleting graph entry from",
            u,
            "for uuid:",
            r
          );
          let f = {};
          n.existsSync(u) && (f = JSON.parse(n.readFileSync(u, "utf-8"))), f[r] && delete f[r], n.writeFileSync(u, JSON.stringify(f, null, 2), "utf-8"), console.log("Graph entry deleted successfully");
        }
        return n.writeFileSync(
          e,
          JSON.stringify(l, null, 2),
          "utf-8"
        ), S("app-data-changed"), { success: !0, message: "Translation added successfully." };
      } catch (e) {
        throw console.error("Error adding translation:", e), new Error(`Failed to delete translation. ${e}`);
      }
    }
  );
}
function B(o) {
  n.existsSync(o) && n.rmSync(o, { recursive: !0, force: !0 });
}
function X() {
  d.handle(
    "deleteDictionary",
    async (o, r) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(t))
          throw new Error("Config file not found.");
        const i = JSON.parse(
          n.readFileSync(t, "utf-8")
        );
        if (!i.dictionaries || !i.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const e = i.dictionaries[r], s = a.resolve(e.route);
        if (!n.existsSync(s) || !n.statSync(s).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${s}`);
        return B(s), delete i.dictionaries[r], n.writeFileSync(t, JSON.stringify(i, null, 2), "utf-8"), S("app-data-changed"), {
          success: !0,
          deletedId: r,
          deletedPath: s
        };
      } catch (t) {
        throw console.error("❌ Error deleting dictionary:", t), new Error("Failed to delete dictionary.");
      }
    }
  );
}
function q() {
  d.handle(
    "renameDictionary",
    async (o, r, t) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(i))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          n.readFileSync(i, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        if (!t || t.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return e.dictionaries[r].name = t.trim(), n.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), S("app-data-changed"), {
          success: !0,
          dictId: r,
          newName: t.trim()
        };
      } catch (i) {
        throw console.error("❌ Error renaming dictionary:", i), new Error("Failed to rename dictionary.");
      }
    }
  );
}
function K() {
  d.handle("loadConfig", async () => {
    try {
      const o = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
      ), r = a.dirname(o);
      if (n.existsSync(r) || n.mkdirSync(r, { recursive: !0 }), !n.existsSync(o))
        return n.writeFileSync(o, JSON.stringify({}, null, 2), "utf-8"), {};
      const t = n.readFileSync(o, "utf-8");
      return JSON.parse(t);
    } catch (o) {
      throw console.error("Error reading JSON file:", o), new Error("Failed to load JSON file.");
    }
  });
}
function Q() {
  d.handle("loadTranslations", async (o, r, t) => {
    try {
      const i = a.join(r, `${t}.json`);
      if (!n.existsSync(i))
        return [];
      const e = n.readFileSync(i, "utf-8"), s = JSON.parse(e || "[]");
      return Array.isArray(s) ? s : [];
    } catch (i) {
      return console.error("Error reading JSON file:", i), [];
    }
  });
}
function _(o, r) {
  n.mkdirSync(r, { recursive: !0 });
  const t = n.readdirSync(o, { withFileTypes: !0 });
  for (const i of t) {
    const e = a.join(o, i.name), s = a.join(r, i.name);
    i.isDirectory() ? _(e, s) : n.copyFileSync(e, s);
  }
}
function Y(o) {
  n.existsSync(o) && n.rmSync(o, { recursive: !0, force: !0 });
}
function ee() {
  d.handle(
    "moveDictionary",
    async (o, r, t) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(i))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          n.readFileSync(i, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const c = e.dictionaries[r].route, l = a.resolve(c), u = a.resolve(t);
        if (!n.existsSync(l) || !n.statSync(l).isDirectory())
          throw new Error(`Source folder does not exist or is not a directory: ${l}`);
        if (!n.existsSync(u) || !n.statSync(u).isDirectory())
          throw new Error(`Destination folder does not exist or is not a directory: ${u}`);
        const f = a.basename(l), h = a.join(u, f), D = (p, R) => {
          const O = a.relative(p, R);
          return !!O && !O.startsWith("..") && !a.isAbsolute(O);
        };
        if (l === h)
          return { success: !0, oldRoute: l, newRoute: h };
        if (D(l, h))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (n.existsSync(h))
          throw new Error(
            `A folder named "${f}" already exists at the destination (${h}).`
          );
        let E = !1;
        try {
          n.renameSync(l, h), E = !0;
        } catch (p) {
          if (p && p.code === "EXDEV")
            _(l, h), Y(l), E = !0;
          else
            throw p;
        }
        if (!E)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return e.dictionaries[r].route = h, n.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), S("app-data-changed"), {
          success: !0,
          oldRoute: l,
          newRoute: h
        };
      } catch (i) {
        throw console.error("❌ Error moving dictionary:", i), new Error("Failed to move dictionary.");
      }
    }
  );
}
function re() {
  d.handle("selectFolder", async () => {
    try {
      const o = await T.showOpenDialog({
        properties: ["openDirectory"]
      });
      return o.canceled ? null : o.filePaths[0];
    } catch (o) {
      throw console.error("Error selecting folder:", o), new Error("Failed to select folder.");
    }
  });
}
function ne() {
  d.handle("fetchGraph", async (o, r, t, i) => {
    try {
      const e = a.join(r, `GRAPH-${t}.json`);
      console.log("Fetching graph from", e, "for dictionary", t), n.existsSync(e) || n.writeFileSync(e, "{}", "utf-8");
      const s = n.readFileSync(e, "utf-8"), c = JSON.parse(s);
      return i ? c[i] || {} : c || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function te() {
  d.handle(
    "saveGraph",
    async (o, r, t, i, e) => {
      try {
        const s = a.join(r, `GRAPH-${t}.json`);
        let c = {};
        return n.existsSync(s) && (c = JSON.parse(n.readFileSync(s, "utf-8"))), c[i.uuid] || (c[i.uuid] = {}), c[e.uuid] || (c[e.uuid] = {}), c[i.uuid][e.uuid] = e.word, c[e.uuid][i.uuid] = i.word, n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error saving graph:", s), new Error("Failed to save graph.");
      }
    }
  );
}
function oe() {
  d.handle(
    "deleteGraphEntry",
    async (o, r, t, i, e) => {
      try {
        const s = a.join(r, `GRAPH-${t}.json`);
        let c = {};
        return n.existsSync(s) && (c = JSON.parse(n.readFileSync(s, "utf-8"))), c[i.uuid] && delete c[i.uuid][e.uuid], c[e.uuid] && delete c[e.uuid][i.uuid], n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error deleting graph entry:", s), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function ie() {
  d.handle(
    "saveUserPreferences",
    async (o, r) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-preferences.json"
        );
        n.existsSync(t) || (n.mkdirSync(a.dirname(t), { recursive: !0 }), n.writeFileSync(t, JSON.stringify({}, null, 2), "utf-8"));
        const i = n.readFileSync(t, "utf-8"), e = JSON.parse(i);
        return Object.assign(e, r), n.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), S("app-data-changed"), e;
      } catch (t) {
        throw console.error("Error saving user preferences file:", t), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function se() {
  d.handle("loadUserPreferences", async (o, r) => {
    try {
      const t = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-preferences.json"
      );
      n.existsSync(t) || (n.mkdirSync(a.dirname(t), { recursive: !0 }), n.writeFileSync(t, JSON.stringify({}, null, 2), "utf-8"));
      const i = n.readFileSync(t, "utf-8");
      return JSON.parse(i);
    } catch (t) {
      throw console.error("Error reading user preferences file:", t), new Error("Failed to load user preferences file.");
    }
  });
}
function ce() {
  d.handle(
    "editConfig",
    async (o, r) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        n.existsSync(t) || (n.mkdirSync(a.dirname(t), { recursive: !0 }), n.writeFileSync(t, JSON.stringify({}, null, 2), "utf-8"));
        const i = n.readFileSync(t, "utf-8"), e = JSON.parse(i);
        return Object.assign(e, r), n.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), S("app-data-changed"), e;
      } catch (t) {
        throw console.error("Error saving user preferences file:", t), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function ae() {
  d.handle("fetchNoteIndex", async (o, r, t) => {
    try {
      const i = r.replace(/\\/g, "/"), e = a.join(
        i,
        `NOTES-${t}`,
        `NOTES-INDEX-${t}.json`
      );
      n.existsSync(e) || (n.mkdirSync(a.dirname(e), { recursive: !0 }), n.writeFileSync(e, JSON.stringify([], null, 2), "utf-8"));
      const s = n.readFileSync(e, "utf-8");
      return JSON.parse(s);
    } catch (i) {
      throw console.error("Error reading markdown file:", i), new Error(`Failed to load markdown file: ${i}`);
    }
  });
}
function le() {
  d.handle(
    "saveNoteIndex",
    async (o, r, t, i) => {
      try {
        const e = r.replace(/\\/g, "/"), s = a.join(
          e,
          `NOTES-${t}`,
          `NOTES-INDEX-${t}.json`
        );
        return n.writeFileSync(s, JSON.stringify(i, null, 2), "utf-8"), S("notes-changed", {
          route: e,
          name: t
        }), { success: !0, path: s };
      } catch (e) {
        throw console.error("Error saving JSON file:", e), new Error(`Failed to save JSON file: ${e}`);
      }
    }
  );
}
function de() {
  d.handle("saveNotes", async (o, r, t, i, e) => {
    try {
      if (typeof r != "string" || typeof t != "string")
        throw new Error("Invalid note route/name.");
      if (typeof i != "string" || !i.trim())
        return { success: !1, error: "Invalid note id." };
      const s = r.replace(/\\/g, "/"), c = a.join(
        s,
        `NOTES-${t}`,
        `${i}.json`
      ), l = a.dirname(c);
      n.mkdirSync(l, { recursive: !0 });
      const u = e && typeof e == "object" ? e : { type: "doc", content: [] };
      return n.writeFileSync(c, JSON.stringify(u, null, 2), "utf-8"), S("notes-changed", {
        route: s,
        name: t,
        uuid: i
      }), { success: !0, path: c };
    } catch (s) {
      throw console.error("Error saving markdown file:", s), new Error(`Failed to save markdown file: ${s}`);
    }
  });
}
function ue() {
  d.handle("fetchNotes", async (o, r, t, i) => {
    try {
      const e = r.replace(/\\/g, "/"), s = a.join(
        e,
        `NOTES-${t}`,
        `${i}.json`
      );
      if (!n.existsSync(s))
        return { type: "doc", content: [] };
      const c = n.readFileSync(s, "utf-8");
      try {
        return JSON.parse(c);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (e) {
      return console.error("Error reading note file:", e), { type: "doc", content: [] };
    }
  });
}
function fe() {
  d.handle("window-minimize", () => {
    const o = g.getFocusedWindow();
    o == null || o.minimize();
  });
}
function ye() {
  d.handle("window-maximize", () => {
    const o = g.getFocusedWindow();
    o && (o.isMaximized() ? o.unmaximize() : o.maximize());
  });
}
function he() {
  d.handle("window-close", () => {
    const o = g.getFocusedWindow();
    o == null || o.close();
  });
}
function Se(o) {
  if (typeof o != "string") return;
  const r = o.trim();
  if (r)
    return r.startsWith("/") ? r : `/${r}`;
}
function we() {
  d.handle("window-open-new", (o, r) => {
    P(Se(r), { hideSidebar: !0 });
  });
}
function ge() {
  Q(), V(), Z(), H(), ee(), X(), q(), re(), K(), ce(), z(), G(), U(), W(), ne(), te(), oe(), ie(), se(), ae(), le(), de(), ue(), fe(), ye(), he(), we();
}
j.on("window-all-closed", () => {
  process.platform !== "darwin" && j.quit();
});
j.on("activate", () => {
  g.getAllWindows().length === 0 && P();
});
j.whenReady().then(() => {
  ge(), P();
});
