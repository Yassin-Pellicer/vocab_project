import { BrowserWindow as g, Menu as D, ipcMain as u, dialog as T, app as E } from "electron";
import { fileURLToPath as b } from "node:url";
import S from "node:path";
import a from "path";
import n from "fs";
import { randomFillSync as A, randomUUID as k } from "node:crypto";
const J = S.dirname(b(import.meta.url));
process.env.APP_ROOT = S.join(J, "..");
const p = process.env.VITE_DEV_SERVER_URL;
S.join(process.env.APP_ROOT, "dist-electron");
const O = S.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? S.join(process.env.APP_ROOT, "public") : O;
function N(o) {
  const r = new g({
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
      preload: S.join(J, "preload.mjs"),
      zoomFactor: 1
    }
  });
  r.webContents.setVisualZoomLevelLimits(1, 5), r.webContents.openDevTools(), D.setApplicationMenu(null), r.webContents.on("did-finish-load", () => {
    r == null || r.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), r.webContents.on("before-input-event", (i, t) => {
    if (t.control)
      if (t.key === "+") {
        const e = r.webContents.getZoomFactor();
        r.webContents.setZoomFactor(Math.min(e + 0.1, 5)), i.preventDefault();
      } else if (t.key === "-") {
        const e = r.webContents.getZoomFactor();
        r.webContents.setZoomFactor(Math.max(e - 0.1, 0.5)), i.preventDefault();
      } else t.key === "0" && (r.webContents.setZoomFactor(1), i.preventDefault());
  }), p ? o ? r.loadURL(`${p}#${encodeURIComponent(o)}`) : r.loadURL(p) : o ? r.loadFile(S.join(O, "index.html"), {
    hash: encodeURIComponent(o)
  }) : r.loadFile(S.join(O, "index.html"));
}
function C() {
  u.handle("fetchConjugation", async (o, r, i, t) => {
    try {
      const e = a.join(r, `CONJ-${i}.json`);
      console.log("Fetching conjugation from", e, t), n.existsSync(e) || n.writeFileSync(e, "{}", "utf-8");
      const s = n.readFileSync(e, "utf-8");
      return JSON.parse(s)[t] || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function U() {
  u.handle("saveConjugation", async (o, r, i, t, e) => {
    try {
      const s = a.join(r, `CONJ-${i}.json`);
      console.log("Saving conjugation to", s, "for uuid:", t);
      let c = {};
      if (n.existsSync(s)) {
        const l = n.readFileSync(s, "utf-8");
        c = JSON.parse(l);
      }
      return c[t] = e, n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (s) {
      throw console.error("Error saving conjugation:", s), new Error("Failed to save conjugation.");
    }
  });
}
function G() {
  u.handle("fetchMarkdown", async (o, r, i, t) => {
    try {
      const e = r.replace(/\\/g, "/"), s = a.join(
        e,
        `MD-${i}`,
        `${t}.json`
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
function z() {
  u.handle(
    "saveMarkdown",
    async (o, r, i, t, e) => {
      var s;
      try {
        const c = r.replace(/\\/g, "/"), l = a.join(
          c,
          `MD-${i}`,
          `${t}.json`
        ), d = a.dirname(l), f = e && e.type === "doc" && Array.isArray(e.content) && e.content.length === 1 && e.content[0].type === "paragraph" && ((s = e.content[0].attrs) == null ? void 0 : s.textAlign) === null && !e.content[0].content;
        return e === null || f ? (n.existsSync(l) && n.unlinkSync(l), { success: !0 }) : (n.mkdirSync(d, { recursive: !0 }), e === void 0 ? n.writeFileSync(l, "", "utf-8") : n.writeFileSync(l, JSON.stringify(e, null, 2), "utf-8"), { success: !0, path: l });
      } catch (c) {
        throw console.error("Error saving markdown file:", c), new Error(`Failed to save markdown file: ${c}`);
      }
    }
  );
}
const y = [];
for (let o = 0; o < 256; ++o)
  y.push((o + 256).toString(16).slice(1));
function W(o, r = 0) {
  return (y[o[r + 0]] + y[o[r + 1]] + y[o[r + 2]] + y[o[r + 3]] + "-" + y[o[r + 4]] + y[o[r + 5]] + "-" + y[o[r + 6]] + y[o[r + 7]] + "-" + y[o[r + 8]] + y[o[r + 9]] + "-" + y[o[r + 10]] + y[o[r + 11]] + y[o[r + 12]] + y[o[r + 13]] + y[o[r + 14]] + y[o[r + 15]]).toLowerCase();
}
const v = new Uint8Array(256);
let m = v.length;
function M() {
  return m > v.length - 16 && (A(v), m = 0), v.slice(m, m += 16);
}
const x = { randomUUID: k };
function I(o, r, i) {
  var e;
  o = o || {};
  const t = o.random ?? ((e = o.rng) == null ? void 0 : e.call(o)) ?? M();
  if (t.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, W(t);
}
function $(o, r, i) {
  return x.randomUUID && !o ? x.randomUUID() : I(o);
}
function V() {
  u.handle(
    "addTranslation",
    async (o, r, i, t, e) => {
      try {
        const s = a.join(t, `${e}.json`);
        if (!n.existsSync(s))
          throw new Error(`The file ${s} does not exist.`);
        const c = JSON.parse(n.readFileSync(s, "utf-8"));
        let l = Array.isArray(c) ? c : [];
        if (i)
          l = l.filter(
            (d) => d.uuid !== i
          );
        else {
          const d = r.uuid || $();
          r.uuid = d;
          const f = a.join(t, `GRAPH-${e}.json`);
          console.log("Saving graph to", f, "for uuid:", r.uuid);
          let h = {};
          n.existsSync(f) && (h = JSON.parse(n.readFileSync(f, "utf-8"))), h[d] = {}, n.writeFileSync(f, JSON.stringify(h, null, 2), "utf-8");
        }
        return l.push(r), n.writeFileSync(
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
    async (o, r, i) => {
      try {
        const t = $(), e = a.resolve(r, t), s = a.join(e, `${t}.json`), c = a.join(e, "MD-" + t), l = a.join(e, "NOTES-" + t);
        if (!n.existsSync(r))
          throw new Error(`The folder ${r} does not exist.`);
        n.existsSync(e) || n.mkdirSync(e, { recursive: !0 }), n.writeFileSync(s, JSON.stringify([], null, 2), "utf-8"), n.mkdirSync(c, { recursive: !0 }), n.mkdirSync(l, { recursive: !0 });
        const d = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        n.existsSync(d) || n.writeFileSync(d, JSON.stringify({ dictionaries: {} }, null, 2), "utf-8");
        const f = JSON.parse(n.readFileSync(d, "utf-8"));
        return f.dictionaries || (f.dictionaries = {}), f.dictionaries[t] = {
          name: i,
          route: e,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, n.writeFileSync(d, JSON.stringify(f, null, 2), "utf-8"), {
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
    async (o, r, i, t) => {
      try {
        const e = a.join(i, `${t}.json`);
        if (!n.existsSync(e))
          throw new Error(`The file ${e} does not exist.`);
        const s = n.readFileSync(e, "utf-8"), c = JSON.parse(s);
        let l = Array.isArray(c) ? c : [];
        l = l.filter((d) => d.uuid !== r);
        {
          const d = a.join(i, `GRAPH-${t}.json`);
          console.log(
            "Deleting graph entry from",
            d,
            "for uuid:",
            r
          );
          let f = {};
          n.existsSync(d) && (f = JSON.parse(n.readFileSync(d, "utf-8"))), f[r] && delete f[r], n.writeFileSync(d, JSON.stringify(f, null, 2), "utf-8"), console.log("Graph entry deleted successfully");
        }
        return n.writeFileSync(
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
function Z(o) {
  n.existsSync(o) && n.rmSync(o, { recursive: !0, force: !0 });
}
function B() {
  u.handle(
    "deleteDictionary",
    async (o, r) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(i))
          throw new Error("Config file not found.");
        const t = JSON.parse(
          n.readFileSync(i, "utf-8")
        );
        if (!t.dictionaries || !t.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const e = t.dictionaries[r], s = a.resolve(e.route);
        if (!n.existsSync(s) || !n.statSync(s).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${s}`);
        return Z(s), delete t.dictionaries[r], n.writeFileSync(i, JSON.stringify(t, null, 2), "utf-8"), {
          success: !0,
          deletedId: r,
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
    async (o, r, i) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(t))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          n.readFileSync(t, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        if (!i || i.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return e.dictionaries[r].name = i.trim(), n.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), {
          success: !0,
          dictId: r,
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
      const o = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-config.json"
      ), r = a.dirname(o);
      if (n.existsSync(r) || n.mkdirSync(r, { recursive: !0 }), !n.existsSync(o))
        return n.writeFileSync(o, JSON.stringify({}, null, 2), "utf-8"), {};
      const i = n.readFileSync(o, "utf-8");
      return JSON.parse(i);
    } catch (o) {
      throw console.error("Error reading JSON file:", o), new Error("Failed to load JSON file.");
    }
  });
}
function K() {
  u.handle("loadTranslations", async (o, r, i) => {
    try {
      const t = a.join(r, `${i}.json`), e = n.readFileSync(t, "utf-8");
      return JSON.parse(e);
    } catch (t) {
      throw console.error("Error reading JSON file:", t), new Error("Failed to load JSON file.");
    }
  });
}
function R(o, r) {
  n.mkdirSync(r, { recursive: !0 });
  const i = n.readdirSync(o, { withFileTypes: !0 });
  for (const t of i) {
    const e = a.join(o, t.name), s = a.join(r, t.name);
    t.isDirectory() ? R(e, s) : n.copyFileSync(e, s);
  }
}
function Q(o) {
  n.existsSync(o) && n.rmSync(o, { recursive: !0, force: !0 });
}
function Y() {
  u.handle(
    "moveDictionary",
    async (o, r, i) => {
      try {
        const t = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        if (!n.existsSync(t))
          throw new Error("Config file not found.");
        const e = JSON.parse(
          n.readFileSync(t, "utf-8")
        );
        if (!e.dictionaries || !e.dictionaries[r])
          throw new Error(`Dictionary with id "${r}" not found in config.`);
        const c = e.dictionaries[r].route, l = a.resolve(c), d = a.resolve(i);
        if (!n.existsSync(l) || !n.statSync(l).isDirectory())
          throw new Error(`Source folder does not exist or is not a directory: ${l}`);
        if (!n.existsSync(d) || !n.statSync(d).isDirectory())
          throw new Error(`Destination folder does not exist or is not a directory: ${d}`);
        const f = a.basename(l), h = a.join(d, f), P = (w, _) => {
          const F = a.relative(w, _);
          return !!F && !F.startsWith("..") && !a.isAbsolute(F);
        };
        if (l === h)
          return { success: !0, oldRoute: l, newRoute: h };
        if (P(l, h))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (n.existsSync(h))
          throw new Error(
            `A folder named "${f}" already exists at the destination (${h}).`
          );
        let j = !1;
        try {
          n.renameSync(l, h), j = !0;
        } catch (w) {
          if (w && w.code === "EXDEV")
            R(l, h), Q(l), j = !0;
          else
            throw w;
        }
        if (!j)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return e.dictionaries[r].route = h, n.writeFileSync(t, JSON.stringify(e, null, 2), "utf-8"), {
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
      const o = await T.showOpenDialog({
        properties: ["openDirectory"]
      });
      return o.canceled ? null : o.filePaths[0];
    } catch (o) {
      throw console.error("Error selecting folder:", o), new Error("Failed to select folder.");
    }
  });
}
function re() {
  u.handle("fetchGraph", async (o, r, i, t) => {
    try {
      const e = a.join(r, `GRAPH-${i}.json`);
      console.log("Fetching graph from", e, "for dictionary", i), n.existsSync(e) || n.writeFileSync(e, "{}", "utf-8");
      const s = n.readFileSync(e, "utf-8"), c = JSON.parse(s);
      return t ? c[t] || {} : c || {};
    } catch (e) {
      throw console.error("Error reading JSON file:", e), new Error("Failed to load JSON file.");
    }
  });
}
function ne() {
  u.handle(
    "saveGraph",
    async (o, r, i, t, e) => {
      try {
        const s = a.join(r, `GRAPH-${i}.json`);
        let c = {};
        return n.existsSync(s) && (c = JSON.parse(n.readFileSync(s, "utf-8"))), c[t.uuid] || (c[t.uuid] = {}), c[e.uuid] || (c[e.uuid] = {}), c[t.uuid][e.uuid] = e.word, c[e.uuid][t.uuid] = t.word, n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph saved successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error saving graph:", s), new Error("Failed to save graph.");
      }
    }
  );
}
function te() {
  u.handle(
    "deleteGraphEntry",
    async (o, r, i, t, e) => {
      try {
        const s = a.join(r, `GRAPH-${i}.json`);
        let c = {};
        return n.existsSync(s) && (c = JSON.parse(n.readFileSync(s, "utf-8"))), c[t.uuid] && delete c[t.uuid][e.uuid], c[e.uuid] && delete c[e.uuid][t.uuid], n.writeFileSync(s, JSON.stringify(c, null, 2), "utf-8"), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error deleting graph entry:", s), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function oe() {
  u.handle(
    "saveUserPreferences",
    async (o, r) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-preferences.json"
        );
        n.existsSync(i) || (n.mkdirSync(a.dirname(i), { recursive: !0 }), n.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
        const t = n.readFileSync(i, "utf-8"), e = JSON.parse(t);
        return Object.assign(e, r), n.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), e;
      } catch (i) {
        throw console.error("Error saving user preferences file:", i), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function ie() {
  u.handle("loadUserPreferences", async (o, r) => {
    try {
      const i = a.join(
        process.env.APP_ROOT || __dirname,
        "public",
        "user-preferences.json"
      );
      n.existsSync(i) || (n.mkdirSync(a.dirname(i), { recursive: !0 }), n.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
      const t = n.readFileSync(i, "utf-8");
      return JSON.parse(t);
    } catch (i) {
      throw console.error("Error reading user preferences file:", i), new Error("Failed to load user preferences file.");
    }
  });
}
function se() {
  u.handle(
    "editConfig",
    async (o, r) => {
      try {
        const i = a.join(
          process.env.APP_ROOT || __dirname,
          "public",
          "user-config.json"
        );
        n.existsSync(i) || (n.mkdirSync(a.dirname(i), { recursive: !0 }), n.writeFileSync(i, JSON.stringify({}, null, 2), "utf-8"));
        const t = n.readFileSync(i, "utf-8"), e = JSON.parse(t);
        return Object.assign(e, r), n.writeFileSync(i, JSON.stringify(e, null, 2), "utf-8"), e;
      } catch (i) {
        throw console.error("Error saving user preferences file:", i), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function ce() {
  u.handle("fetchNoteIndex", async (o, r, i) => {
    try {
      const t = r.replace(/\\/g, "/"), e = a.join(
        t,
        `NOTES-${i}`,
        `NOTES-INDEX-${i}.json`
      );
      n.existsSync(e) || (n.mkdirSync(a.dirname(e), { recursive: !0 }), n.writeFileSync(e, JSON.stringify([], null, 2), "utf-8"));
      const s = n.readFileSync(e, "utf-8");
      return JSON.parse(s);
    } catch (t) {
      throw console.error("Error reading markdown file:", t), new Error(`Failed to load markdown file: ${t}`);
    }
  });
}
function ae() {
  u.handle(
    "saveNoteIndex",
    async (o, r, i, t) => {
      try {
        const e = r.replace(/\\/g, "/");
        let s = a.join(
          e,
          `NOTES-${i}`,
          `NOTES-INDEX-${i}.json`
        );
        return n.writeFileSync(s, JSON.stringify(t, null, 2), "utf-8"), { success: !0, path: s };
      } catch (e) {
        throw console.error("Error saving JSON file:", e), new Error(`Failed to save JSON file: ${e}`);
      }
    }
  );
}
function le() {
  u.handle("saveNotes", async (o, r, i, t, e) => {
    try {
      const s = r.replace(/\\/g, "/"), c = a.join(
        s,
        `NOTES-${i}`,
        `${t}.json`
      ), l = a.dirname(c);
      return e === null ? (n.existsSync(c) && n.unlinkSync(c), { success: !0 }) : (n.mkdirSync(l, { recursive: !0 }), e === void 0 ? n.writeFileSync(c, "", "utf-8") : n.writeFileSync(c, JSON.stringify(e, null, 2), "utf-8"), { success: !0, path: c });
    } catch (s) {
      throw console.error("Error saving markdown file:", s), new Error(`Failed to save markdown file: ${s}`);
    }
  });
}
function ue() {
  u.handle("fetchNotes", async (o, r, i, t) => {
    try {
      const e = r.replace(/\\/g, "/"), s = a.join(
        e,
        `NOTES-${i}`,
        `${t}.json`
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
function de() {
  u.handle("saveImage", async (o, r, i, t, e) => {
    try {
      const s = r.replace(/\\/g, "/"), c = a.join(
        s,
        `NOTES-${i}`,
        "RESOURCES"
      );
      n.mkdirSync(c, { recursive: !0 }), console.log("SAVED IMGE SAVED IMG");
      const l = a.extname(e), f = `${a.basename(e, l)}-${Date.now()}${l}`, h = a.join(c, f);
      return n.writeFileSync(h, Buffer.from(t)), { success: !0, url: `file://${h.replace(/\\/g, "/")}` };
    } catch (s) {
      throw console.error("Error saving image:", s), new Error(`Failed to save image: ${s}`);
    }
  });
}
function fe() {
  u.handle("window-minimize", () => {
    const o = g.getFocusedWindow();
    o == null || o.minimize();
  });
}
function ye() {
  u.handle("window-maximize", () => {
    const o = g.getFocusedWindow();
    o && (o.isMaximized() ? o.unmaximize() : o.maximize());
  });
}
function he() {
  u.handle("window-close", () => {
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
  u.handle("window-open-new", (o, r) => {
    N(Se(r));
  });
}
function ge() {
  K(), V(), H(), L(), Y(), B(), X(), ee(), q(), se(), G(), z(), C(), U(), re(), ne(), te(), oe(), ie(), ce(), ae(), le(), ue(), de(), fe(), ye(), he(), we();
}
E.on("window-all-closed", () => {
  process.platform !== "darwin" && E.quit();
});
E.on("activate", () => {
  g.getAllWindows().length === 0 && N();
});
E.whenReady().then(() => {
  ge(), N();
});
