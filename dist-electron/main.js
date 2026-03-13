import { BrowserWindow as g, Menu as _, ipcMain as u, dialog as T, app as v } from "electron";
import { fileURLToPath as b } from "node:url";
import S from "node:path";
import a from "path";
import r from "fs";
import { randomFillSync as A, randomUUID as k } from "node:crypto";
const N = S.dirname(b(import.meta.url));
process.env.APP_ROOT = S.join(N, "..");
const F = process.env.VITE_DEV_SERVER_URL;
S.join(process.env.APP_ROOT, "dist-electron");
const x = S.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = F ? S.join(process.env.APP_ROOT, "public") : x;
function J() {
  const n = new g({
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
      preload: S.join(N, "preload.mjs"),
      zoomFactor: 1
    }
  });
  n.webContents.setVisualZoomLevelLimits(1, 5), n.webContents.openDevTools(), _.setApplicationMenu(null), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n.webContents.on("before-input-event", (o, i) => {
    if (i.control)
      if (i.key === "+") {
        const t = n.webContents.getZoomFactor();
        n.webContents.setZoomFactor(Math.min(t + 0.1, 5)), o.preventDefault();
      } else if (i.key === "-") {
        const t = n.webContents.getZoomFactor();
        n.webContents.setZoomFactor(Math.max(t - 0.1, 0.5)), o.preventDefault();
      } else i.key === "0" && (n.webContents.setZoomFactor(1), o.preventDefault());
  }), F ? n.loadURL(F) : n.loadFile(S.join(x, "index.html"));
}
function C() {
  u.handle("fetchConjugation", async (n, o, i, t) => {
    try {
      const e = a.join(o, `CONJ-${i}.json`);
      console.log("Fetching conjugation from", e, t), r.existsSync(e) || r.writeFileSync(e, "{}", "utf-8");
      const s = r.readFileSync(e, "utf-8");
      return JSON.parse(s)[t] || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function U() {
  u.handle("saveConjugation", async (n, o, i, t, e) => {
    try {
      const s = a.join(o, `CONJ-${i}.json`);
      console.log("Saving conjugation to", s, "for uuid:", t);
      let c = {};
      if (r.existsSync(s)) {
        const l = r.readFileSync(s, "utf-8");
        c = JSON.parse(l);
      }
      return c[t] = e, r.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (s) {
      throw console.error("Error saving conjugation:", s), new Error("Failed to save conjugation.");
    }
  });
}
function G() {
  u.handle("fetchMarkdown", async (n, o, i, t) => {
    try {
      const e = o.replace(/\\/g, "/"), s = a.join(
        e,
        `MD-${i}`,
        `${t}.json`
      );
      if (!r.existsSync(s))
        return { type: "doc", content: [] };
      const c = r.readFileSync(s, "utf-8");
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
function z() {
  u.handle(
    "saveMarkdown",
    async (n, o, i, t, e) => {
      var s;
      try {
        const c = o.replace(/\\/g, "/"), l = a.join(
          c,
          `MD-${i}`,
          `${t}.json`
        ), d = a.dirname(l), f = e && e.type === "doc" && Array.isArray(e.content) && e.content.length === 1 && e.content[0].type === "paragraph" && ((s = e.content[0].attrs) == null ? void 0 : s.textAlign) === null && !e.content[0].content;
        return e === null || f ? (r.existsSync(l) && r.unlinkSync(l), { success: !0 }) : (r.mkdirSync(d, { recursive: !0 }), e === void 0 ? r.writeFileSync(l, "", "utf-8") : r.writeFileSync(l, JSON.stringify(e, null, 2), "utf-8"), { success: !0, path: l });
      } catch (c) {
        throw console.error("Error saving markdown file:", c), new Error(`Failed to save markdown file: ${c}`);
      }
    }
  );
}
const y = [];
for (let n = 0; n < 256; ++n)
  y.push((n + 256).toString(16).slice(1));
function M(n, o = 0) {
  return (y[n[o + 0]] + y[n[o + 1]] + y[n[o + 2]] + y[n[o + 3]] + "-" + y[n[o + 4]] + y[n[o + 5]] + "-" + y[n[o + 6]] + y[n[o + 7]] + "-" + y[n[o + 8]] + y[n[o + 9]] + "-" + y[n[o + 10]] + y[n[o + 11]] + y[n[o + 12]] + y[n[o + 13]] + y[n[o + 14]] + y[n[o + 15]]).toLowerCase();
}
const p = new Uint8Array(256);
let m = p.length;
function W() {
  return m > p.length - 16 && (A(p), m = 0), p.slice(m, m += 16);
}
const P = { randomUUID: k };
function V(n, o, i) {
  var e;
  n = n || {};
  const t = n.random ?? ((e = n.rng) == null ? void 0 : e.call(n)) ?? W();
  if (t.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, M(t);
}
function $(n, o, i) {
  return P.randomUUID && !n ? P.randomUUID() : V(n);
}
function I() {
  u.handle(
    "addTranslation",
    async (n, o, i, t, e) => {
      try {
        const s = a.join(t, `${e}.json`);
        if (!r.existsSync(s))
          throw new Error(`The file ${s} does not exist.`);
        const c = JSON.parse(r.readFileSync(s, "utf-8"));
        let l = Array.isArray(c) ? c : [];
        if (i)
          l = l.filter(
            (d) => d.uuid !== i
          );
        else {
          const d = o.uuid || $();
          o.uuid = d;
          const f = a.join(t, `GRAPH-${e}.json`);
          console.log("Saving graph to", f, "for uuid:", o.uuid);
          let h = {};
          r.existsSync(f) && (h = JSON.parse(r.readFileSync(f, "utf-8"))), h[d] = {}, r.writeFileSync(f, JSON.stringify(h, null, 2), "utf-8");
        }
        return l.push(o), r.writeFileSync(
          s,
          JSON.stringify(l, null, 2),
          "utf-8"
        ), { success: !0 };
      } catch (s) {
        throw console.error("Error adding translation:", s), new Error(`Failed to add translation. ${t}, ${s}`);
      }
    }
  );
}
function L() {
  u.handle(
    "createDictionary",
    async (n, o, i) => {
      try {
        const t = $(), e = a.resolve(o, t), s = a.join(e, `${t}.json`), c = a.join(e, "MD-" + t), l = a.join(e, "NOTES-" + t);
        if (!r.existsSync(o))
          throw new Error(`The folder ${o} does not exist.`);
        r.existsSync(e) || r.mkdirSync(e, { recursive: !0 }), r.writeFileSync(s, JSON.stringify([], null, 2), "utf-8"), r.mkdirSync(c, { recursive: !0 }), r.mkdirSync(l, { recursive: !0 });
        const d = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        r.existsSync(d) || r.writeFileSync(d, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        const f = JSON.parse(r.readFileSync(d, "utf-8"));
        return f.dictionaries || (f.dictionaries = {}), f.dictionaries[t] = {
          name: i,
          route: e,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, r.writeFileSync(d, JSON.stringify(f, null, 2), "utf-8"), {
          success: !0,
          folderName: t,
          folderPath: e
        };
      } catch (t) {
        throw console.error("❌ Error creating dictionary:", t), new Error("Failed to create dictionary.");
      }
    }
  );
}
function H() {
  u.handle(
    "deleteTranslation",
    async (n, o, i, t) => {
      try {
        const e = a.join(i, `${t}.json`);
        if (!r.existsSync(e))
          throw new Error(`The file ${e} does not exist.`);
        const s = r.readFileSync(e, "utf-8"), c = JSON.parse(s);
        let l = Array.isArray(c) ? c : [];
        l = l.filter((d) => d.uuid !== o);
        {
          const d = a.join(i, `GRAPH-${t}.json`);
          console.log(
            "Deleting graph entry from",
            d,
            "for uuid:",
            o
          );
          let f = {};
          r.existsSync(d) && (f = JSON.parse(r.readFileSync(d, "utf-8"))), f[o] && delete f[o], r.writeFileSync(d, JSON.stringify(f, null, 2), "utf-8"), console.log("Graph entry deleted successfully");
        }
        return r.writeFileSync(
          e,
          JSON.stringify(l, null, 2),
          "utf-8"
        ), { success: !0, message: "Translation added successfully." };
      } catch (e) {
        throw console.error("Error adding translation:", e), new Error(`Failed to delete translation. ${e}`);
      }
    }
  );
}
function Z(n) {
  r.existsSync(n) && r.rmSync(n, { recursive: !0, force: !0 });
}
function B() {
  u.handle(
    "deleteDictionary",
    async (n, o) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!r.existsSync(i))
          throw new Error("Config file not found.");
        const t = JSON.parse(
          r.readFileSync(i, "utf-8")
        );
        if (!t.dictionaries || !t.dictionaries[o])
          throw new Error(`Dictionary with id "${o}" not found in config.`);
        const e = t.dictionaries[o], s = a.resolve(e.route);
        if (!r.existsSync(s) || !r.statSync(s).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${s}`);
        return Z(s), delete t.dictionaries[o], r.writeFileSync(i, JSON.stringify(t, null, 2), "utf-8"), {
          success: !0,
          deletedId: o,
          deletedPath: s
        };
      } catch (i) {
        throw console.error("❌ Error deleting dictionary:", i), new Error("Failed to delete dictionary.");
      }
    }
  );
}
function X() {
  u.handle(
    "renameDictionary",
    async (n, o, i) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!r.existsSync(t))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          r.readFileSync(t, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[o])
          throw new Error(`Dictionary with id "${o}" not found in config.`);
        if (!i || i.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return e.dictionaries[o].name = i.trim(), r.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), {
          success: !0,
          dictId: o,
          newName: i.trim()
        };
      } catch (t) {
        throw console.error("❌ Error renaming dictionary:", t), new Error("Failed to rename dictionary.");
      }
    }
  );
}
function q() {
  u.handle("loadConfig", async () => {
    try {
      const n = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
      ), o = a.dirname(n);
      if (r.existsSync(o) || r.mkdirSync(o, { recursive: !0 }), !r.existsSync(n))
        return r.writeFileSync(n, JSON.stringify({}, null, 2), "utf-8"), {};
      const i = r.readFileSync(n, "utf-8");
      return JSON.parse(i);
    } catch (n) {
      throw console.error("Error reading JSON file:", n), new Error("Failed to load JSON file.");
    }
  });
}
function K() {
  u.handle("loadTranslations", async (n, o, i) => {
    try {
      const t = a.join(o, `${i}.json`), e = r.readFileSync(t, "utf-8");
      return JSON.parse(e);
    } catch (t) {
      throw console.error("Error reading JSON file:", t), new Error("Failed to load JSON file.");
    }
  });
}
function D(n, o) {
  r.mkdirSync(o, { recursive: !0 });
  const i = r.readdirSync(n, { withFileTypes: !0 });
  for (const t of i) {
    const e = a.join(n, t.name), s = a.join(o, t.name);
    t.isDirectory() ? D(e, s) : r.copyFileSync(e, s);
  }
}
function Q(n) {
  r.existsSync(n) && r.rmSync(n, { recursive: !0, force: !0 });
}
function Y() {
  u.handle(
    "moveDictionary",
    async (n, o, i) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!r.existsSync(t))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          r.readFileSync(t, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[o])
          throw new Error(`Dictionary with id "${o}" not found in config.`);
        const c = e.dictionaries[o].route, l = a.resolve(c), d = a.resolve(i);
        if (!r.existsSync(l) || !r.statSync(l).isDirectory())
          throw new Error(`Source folder does not exist or is not a directory: ${l}`);
        if (!r.existsSync(d) || !r.statSync(d).isDirectory())
          throw new Error(`Destination folder does not exist or is not a directory: ${d}`);
        const f = a.basename(l), h = a.join(d, f), O = (w, R) => {
          const j = a.relative(w, R);
          return !!j && !j.startsWith("..") && !a.isAbsolute(j);
        };
        if (l === h)
          return { success: !0, oldRoute: l, newRoute: h };
        if (O(l, h))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (r.existsSync(h))
          throw new Error(
            `A folder named "${f}" already exists at the destination (${h}).`
          );
        let E = !1;
        try {
          r.renameSync(l, h), E = !0;
        } catch (w) {
          if (w && w.code === "EXDEV")
            D(l, h), Q(l), E = !0;
          else
            throw w;
        }
        if (!E)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return e.dictionaries[o].route = h, r.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), {
          success: !0,
          oldRoute: l,
          newRoute: h
        };
      } catch (t) {
        throw console.error("❌ Error moving dictionary:", t), new Error("Failed to move dictionary.");
      }
    }
  );
}
function ee() {
  u.handle("selectFolder", async () => {
    try {
      const n = await T.showOpenDialog({
        properties: ["openDirectory"]
      });
      return n.canceled ? null : n.filePaths[0];
    } catch (n) {
      throw console.error("Error selecting folder:", n), new Error("Failed to select folder.");
    }
  });
}
function re() {
  u.handle("fetchGraph", async (n, o, i, t) => {
    try {
      const e = a.join(o, `GRAPH-${i}.json`);
      console.log("Fetching graph from", e, "for dictionary", i), r.existsSync(e) || r.writeFileSync(e, "{}", "utf-8");
      const s = r.readFileSync(e, "utf-8"), c = JSON.parse(s);
      return t ? c[t] || {} : c || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function ne() {
  u.handle(
    "saveGraph",
    async (n, o, i, t, e) => {
      try {
        const s = a.join(o, `GRAPH-${i}.json`);
        let c = {};
        return r.existsSync(s) && (c = JSON.parse(r.readFileSync(s, "utf-8"))), c[t.uuid] || (c[t.uuid] = {}), c[e.uuid] || (c[e.uuid] = {}), c[t.uuid][e.uuid] = e.word, c[e.uuid][t.uuid] = t.word, r.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error saving graph:", s), new Error("Failed to save graph.");
      }
    }
  );
}
function te() {
  u.handle(
    "deleteGraphEntry",
    async (n, o, i, t, e) => {
      try {
        const s = a.join(o, `GRAPH-${i}.json`);
        let c = {};
        return r.existsSync(s) && (c = JSON.parse(r.readFileSync(s, "utf-8"))), c[t.uuid] && delete c[t.uuid][e.uuid], c[e.uuid] && delete c[e.uuid][t.uuid], r.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error deleting graph entry:", s), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function oe() {
  u.handle(
    "saveUserPreferences",
    async (n, o) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-preferences.json"
        );
        r.existsSync(i) || (r.mkdirSync(a.dirname(i), { recursive: !0 }), r.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
        const t = r.readFileSync(i, "utf-8"), e = JSON.parse(t);
        return Object.assign(e, o), r.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), e;
      } catch (i) {
        throw console.error("Error saving user preferences file:", i), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function ie() {
  u.handle("loadUserPreferences", async (n, o) => {
    try {
      const i = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-preferences.json"
      );
      r.existsSync(i) || (r.mkdirSync(a.dirname(i), { recursive: !0 }), r.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
      const t = r.readFileSync(i, "utf-8");
      return JSON.parse(t);
    } catch (i) {
      throw console.error("Error reading user preferences file:", i), new Error("Failed to load user preferences file.");
    }
  });
}
function se() {
  u.handle(
    "editConfig",
    async (n, o) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        r.existsSync(i) || (r.mkdirSync(a.dirname(i), { recursive: !0 }), r.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
        const t = r.readFileSync(i, "utf-8"), e = JSON.parse(t);
        return Object.assign(e, o), r.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), e;
      } catch (i) {
        throw console.error("Error saving user preferences file:", i), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function ce() {
  u.handle("fetchNoteIndex", async (n, o, i) => {
    try {
      const t = o.replace(/\\/g, "/"), e = a.join(
        t,
        `NOTES-${i}`,
        `NOTES-INDEX-${i}.json`
      );
      r.existsSync(e) || (r.mkdirSync(a.dirname(e), { recursive: !0 }), r.writeFileSync(e, JSON.stringify([], null, 2), "utf-8"));
      const s = r.readFileSync(e, "utf-8");
      return JSON.parse(s);
    } catch (t) {
      throw console.error("Error reading markdown file:", t), new Error(`Failed to load markdown file: ${t}`);
    }
  });
}
function ae() {
  u.handle(
    "saveNoteIndex",
    async (n, o, i, t) => {
      try {
        const e = o.replace(/\\/g, "/");
        let s = a.join(
          e,
          `NOTES-${i}`,
          `NOTES-INDEX-${i}.json`
        );
        return r.writeFileSync(s, JSON.stringify(t, null, 2), "utf-8"), { success: !0, path: s };
      } catch (e) {
        throw console.error("Error saving JSON file:", e), new Error(`Failed to save JSON file: ${e}`);
      }
    }
  );
}
function le() {
  u.handle("saveNotes", async (n, o, i, t, e) => {
    try {
      const s = o.replace(/\\/g, "/"), c = a.join(
        s,
        `NOTES-${i}`,
        `${t}.json`
      ), l = a.dirname(c);
      return e === null ? (r.existsSync(c) && r.unlinkSync(c), { success: !0 }) : (r.mkdirSync(l, { recursive: !0 }), e === void 0 ? r.writeFileSync(c, "", "utf-8") : r.writeFileSync(c, JSON.stringify(e, null, 2), "utf-8"), { success: !0, path: c });
    } catch (s) {
      throw console.error("Error saving markdown file:", s), new Error(`Failed to save markdown file: ${s}`);
    }
  });
}
function ue() {
  u.handle("fetchNotes", async (n, o, i, t) => {
    try {
      const e = o.replace(/\\/g, "/"), s = a.join(
        e,
        `NOTES-${i}`,
        `${t}.json`
      );
      if (!r.existsSync(s))
        return { type: "doc", content: [] };
      const c = r.readFileSync(s, "utf-8");
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
function de() {
  u.handle("saveImage", async (n, o, i, t, e) => {
    try {
      const s = o.replace(/\\/g, "/"), c = a.join(
        s,
        `NOTES-${i}`,
        "RESOURCES"
      );
      r.mkdirSync(c, { recursive: !0 }), console.log("SAVED IMGE SAVED IMG");
      const l = a.extname(e), f = `${a.basename(e, l)}-${Date.now()}${l}`, h = a.join(c, f);
      return r.writeFileSync(h, Buffer.from(t)), { success: !0, url: `file://${h.replace(/\\/g, "/")}` };
    } catch (s) {
      throw console.error("Error saving image:", s), new Error(`Failed to save image: ${s}`);
    }
  });
}
function fe() {
  u.handle("window-minimize", () => {
    const n = g.getFocusedWindow();
    n == null || n.minimize();
  });
}
function ye() {
  u.handle("window-maximize", () => {
    const n = g.getFocusedWindow();
    n && (n.isMaximized() ? n.unmaximize() : n.maximize());
  });
}
function he() {
  u.handle("window-close", () => {
    const n = g.getFocusedWindow();
    n == null || n.close();
  });
}
function Se() {
  K(), I(), H(), L(), Y(), B(), X(), ee(), q(), se(), G(), z(), C(), U(), re(), ne(), te(), oe(), ie(), ce(), ae(), le(), ue(), de(), fe(), ye(), he();
}
v.on("window-all-closed", () => {
  process.platform !== "darwin" && v.quit();
});
v.on("activate", () => {
  g.getAllWindows().length === 0 && J();
});
v.whenReady().then(() => {
  Se(), J();
});
