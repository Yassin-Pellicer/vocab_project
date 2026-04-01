import { BrowserWindow as N, Menu as Y, ipcMain as u, app as D, dialog as ee } from "electron";
import { fileURLToPath as re } from "node:url";
import h from "node:path";
import E from "path";
import d from "fs";
import { randomFillSync as ne, randomUUID as te } from "node:crypto";
import P, { promises as v } from "node:fs";
const _ = h.dirname(re(import.meta.url));
process.env.APP_ROOT = h.join(_, "..");
const A = process.env.VITE_DEV_SERVER_URL;
h.join(process.env.APP_ROOT, "dist-electron");
const L = h.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = A ? h.join(process.env.APP_ROOT, "public") : L;
function R(r, e) {
  const n = new N({
    width: 1200,
    height: 800,
    frame: !0,
    titleBarStyle: "hidden",
    backgroundColor: "#ffffff",
    hasShadow: !1,
    webPreferences: {
      preload: h.join(_, "preload.mjs"),
      zoomFactor: 1
    }
  });
  n.webContents.setVisualZoomLevelLimits(1, 5), n.webContents.openDevTools(), Y.setApplicationMenu(null), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n.webContents.on("before-input-event", (o, i) => {
    if (i.control)
      if (i.key === "+") {
        const a = n.webContents.getZoomFactor();
        n.webContents.setZoomFactor(Math.min(a + 0.1, 5)), o.preventDefault();
      } else if (i.key === "-") {
        const a = n.webContents.getZoomFactor();
        n.webContents.setZoomFactor(Math.max(a - 0.1, 0.5)), o.preventDefault();
      } else i.key === "0" && (n.webContents.setZoomFactor(1), o.preventDefault());
  });
  const t = typeof (e == null ? void 0 : e.hideSidebar) == "boolean" ? `?hideSidebar=${e.hideSidebar ? "1" : "0"}` : "";
  if (A) {
    const o = r ? `#${encodeURIComponent(r)}` : "";
    n.loadURL(`${A}${t}${o}`);
  } else
    n.loadFile(h.join(L, "index.html"), {
      hash: r ? encodeURIComponent(r) : void 0,
      search: t || void 0
    });
}
function oe() {
  u.handle("fetchConjugation", async (r, e, n, t) => {
    try {
      const o = E.join(e, `CONJ-${n}.json`);
      console.log("Fetching conjugation from", o, t), d.existsSync(o) || d.writeFileSync(o, "{}", "utf-8");
      const i = d.readFileSync(o, "utf-8");
      return JSON.parse(i)[t] || {};
    } catch (o) {
      throw console.error("Error reading JSON file:", o), new Error("Failed to load JSON file.");
    }
  });
}
function ie() {
  u.handle("saveConjugation", async (r, e, n, t, o) => {
    try {
      const i = E.join(e, `CONJ-${n}.json`);
      console.log("Saving conjugation to", i, "for uuid:", t);
      let a = {};
      if (d.existsSync(i)) {
        const s = d.readFileSync(i, "utf-8");
        a = JSON.parse(s);
      }
      return a[t] = o, d.writeFileSync(i, JSON.stringify(a, null, 2), "utf-8"), console.log("Conjugation saved successfully"), { success: !0 };
    } catch (i) {
      throw console.error("Error saving conjugation:", i), new Error("Failed to save conjugation.");
    }
  });
}
function ae() {
  u.handle("fetchMarkdown", async (r, e, n, t) => {
    try {
      const o = e.replace(/\\/g, "/"), i = E.join(
        o,
        `MD-${n}`,
        `${t}.json`
      );
      if (!d.existsSync(i))
        return { type: "doc", content: [] };
      const a = d.readFileSync(i, "utf-8");
      try {
        return JSON.parse(a);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (o) {
      throw console.error("Error reading markdown file:", o), new Error(`Failed to load markdown file: ${o}`);
    }
  });
}
function se() {
  u.handle(
    "saveMarkdown",
    async (r, e, n, t, o) => {
      var i;
      try {
        const a = e.replace(/\\/g, "/"), s = E.join(
          a,
          `MD-${n}`,
          `${t}.json`
        ), c = E.dirname(s), l = o && o.type === "doc" && Array.isArray(o.content) && o.content.length === 1 && o.content[0].type === "paragraph" && ((i = o.content[0].attrs) == null ? void 0 : i.textAlign) === null && !o.content[0].content;
        return o === null || l ? (d.existsSync(s) && d.unlinkSync(s), { success: !0 }) : (d.mkdirSync(c, { recursive: !0 }), o === void 0 ? d.writeFileSync(s, "", "utf-8") : d.writeFileSync(s, JSON.stringify(o, null, 2), "utf-8"), { success: !0, path: s });
      } catch (a) {
        throw console.error("Error saving markdown file:", a), new Error(`Failed to save markdown file: ${a}`);
      }
    }
  );
}
const m = [];
for (let r = 0; r < 256; ++r)
  m.push((r + 256).toString(16).slice(1));
function ce(r, e = 0) {
  return (m[r[e + 0]] + m[r[e + 1]] + m[r[e + 2]] + m[r[e + 3]] + "-" + m[r[e + 4]] + m[r[e + 5]] + "-" + m[r[e + 6]] + m[r[e + 7]] + "-" + m[r[e + 8]] + m[r[e + 9]] + "-" + m[r[e + 10]] + m[r[e + 11]] + m[r[e + 12]] + m[r[e + 13]] + m[r[e + 14]] + m[r[e + 15]]).toLowerCase();
}
const C = new Uint8Array(256);
let T = C.length;
function le() {
  return T > C.length - 16 && (ne(C), T = 0), C.slice(T, T += 16);
}
const J = { randomUUID: te };
function de(r, e, n) {
  var o;
  r = r || {};
  const t = r.random ?? ((o = r.rng) == null ? void 0 : o.call(r)) ?? le();
  if (t.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, ce(t);
}
function z(r, e, n) {
  return J.randomUUID && !r ? J.randomUUID() : de(r);
}
function F(r, e) {
  for (const n of N.getAllWindows())
    n.isDestroyed() || n.webContents.send(r, e);
}
const G = (r) => typeof r == "object" && r !== null, U = (r) => Array.isArray(r) ? Array.from(
  new Set(r.filter((e) => typeof e == "string"))
).sort() : [], ue = (r, e) => r.length === e.length && r.every((n, t) => n === e[t]), fe = (r, e) => {
  var n, t;
  return ((t = (n = r.pair[0]) == null ? void 0 : n.original) == null ? void 0 : t.word) || e;
}, M = (r, e) => E.join(r, `${e}.json`), he = (r, e) => E.join(r, `GRAPH-${e}.json`), ye = (r) => {
  const e = d.readFileSync(r, "utf-8"), n = JSON.parse(e || "[]");
  return Array.isArray(n) ? n : [];
}, O = (r, e) => {
  d.writeFileSync(r, JSON.stringify(e, null, 2), "utf-8");
}, we = (r) => {
  if (!d.existsSync(r)) return {};
  try {
    const e = d.readFileSync(r, "utf-8"), n = JSON.parse(e || "{}");
    return G(n) ? n : {};
  } catch (e) {
    return console.error("Failed to read legacy graph payload:", e), {};
  }
}, I = (r, e = {}) => {
  const n = /* @__PURE__ */ new Map();
  r.forEach((i) => {
    i.uuid && n.set(i.uuid, i);
  });
  const t = /* @__PURE__ */ new Map();
  n.forEach((i, a) => {
    const s = U(i.linkedWordIds).filter(
      (c) => c !== a && n.has(c)
    );
    t.set(a, new Set(s));
  }), Object.entries(e).forEach(([i, a]) => {
    !n.has(i) || !G(a) || Object.keys(a).forEach((s) => {
      var c;
      s !== i && n.has(s) && ((c = t.get(i)) == null || c.add(s));
    });
  }), t.forEach((i, a) => {
    Array.from(i).forEach((s) => {
      var c;
      if (s === a || !t.has(s)) {
        i.delete(s);
        return;
      }
      (c = t.get(s)) == null || c.add(a);
    });
  });
  let o = !1;
  return n.forEach((i, a) => {
    const s = Array.from(t.get(a) ?? []).sort(), c = U(i.linkedWordIds).filter(
      (l) => l !== a && n.has(l)
    );
    ue(c, s) || (o = !0), i.linkedWordIds = s;
  }), o;
}, b = (r, e) => {
  const n = M(r, e), t = he(r, e);
  if (!d.existsSync(n))
    throw new Error(`The file ${n} does not exist.`);
  const o = ye(n), i = we(t), a = I(o, i);
  return {
    dictionaryFilePath: n,
    legacyGraphFilePath: t,
    translations: o,
    changed: a
  };
}, ge = (r) => {
  const e = {}, n = /* @__PURE__ */ new Map();
  return r.forEach((t) => {
    t.uuid && (n.set(t.uuid, t), e[t.uuid] = {});
  }), n.forEach((t, o) => {
    (t.linkedWordIds ?? []).forEach((a) => {
      const s = n.get(a);
      s && (e[o][a] = fe(s, a));
    });
  }), e;
}, k = (r) => {
  if (d.existsSync(r))
    try {
      d.unlinkSync(r);
    } catch (e) {
      console.error("Failed to remove legacy graph file:", e);
    }
};
function pe() {
  u.handle(
    "addTranslation",
    async (r, e, n, t, o) => {
      try {
        const {
          dictionaryFilePath: i,
          legacyGraphFilePath: a,
          translations: s,
          changed: c
        } = b(t, o);
        let l = [...s], g = c;
        if (n) {
          const y = l.find(
            (w) => w.uuid === n
          );
          l = l.filter(
            (w) => w.uuid !== n
          ), e.linkedWordIds = y != null && y.linkedWordIds ? [...y.linkedWordIds] : [];
        } else {
          const y = e.uuid || z();
          e.uuid = y, Array.isArray(e.linkedWordIds) || (e.linkedWordIds = []);
        }
        if (e.uuid) {
          const y = Array.from(
            new Set(
              (e.linkedWordIds ?? []).filter(
                (w) => typeof w == "string" && w !== e.uuid
              )
            )
          ).sort();
          e.linkedWordIds = y;
        }
        l.push(e);
        const f = I(l);
        return g = g || f, O(i, l), (g || d.existsSync(a)) && k(a), F("app-data-changed"), { success: !0 };
      } catch (i) {
        throw console.error("Error adding translation:", i), new Error(`Failed to add translation. ${t}, ${i}`);
      }
    }
  );
}
const me = "user-config.json", Ee = "user-preferences.json", ve = () => D.getPath("userData"), q = (r) => h.join(ve(), r);
async function V(r) {
  await v.mkdir(h.dirname(r), { recursive: !0 });
}
async function B(r, e) {
  try {
    const n = await v.readFile(r, "utf-8");
    return JSON.parse(n);
  } catch (n) {
    if (typeof n == "object" && n !== null && "code" in n && n.code === "ENOENT")
      return await V(r), await v.writeFile(r, JSON.stringify(e, null, 2), "utf-8"), e;
    throw n;
  }
}
async function Z(r, e) {
  await V(r);
  const n = `${r}.${process.pid}.${Date.now()}.tmp`;
  await v.writeFile(n, JSON.stringify(e, null, 2), "utf-8"), await v.rename(n, r);
}
const Se = {}, Fe = {}, H = () => q(me), X = () => q(Ee);
async function $() {
  const r = H();
  return B(r, Se);
}
async function x(r) {
  return Z(H(), r);
}
async function K() {
  const r = X();
  return B(r, Fe);
}
async function Pe(r) {
  return Z(X(), r);
}
function je() {
  u.handle(
    "createDictionary",
    async (r, e, n) => {
      try {
        const t = z(), o = h.resolve(e, t), i = h.join(o, `${t}.json`), a = h.join(o, "MD-" + t), s = h.join(o, "NOTES-" + t);
        if (!P.existsSync(e))
          throw new Error(`The folder ${e} does not exist.`);
        P.existsSync(o) || P.mkdirSync(o, { recursive: !0 }), P.writeFileSync(i, JSON.stringify([], null, 2), "utf-8"), P.mkdirSync(a, { recursive: !0 }), P.mkdirSync(s, { recursive: !0 });
        const c = await $();
        return c.dictionaries || (c.dictionaries = {}), c.dictionaries[t] = {
          name: n,
          route: o,
          typeWordWithPrecededArticle: "",
          typeWordWithTenses: ""
        }, await x(c), F("app-data-changed"), {
          success: !0,
          folderName: t,
          folderPath: o
        };
      } catch (t) {
        throw console.error("❌ Error creating dictionary:", t), new Error("Failed to create dictionary.");
      }
    }
  );
}
function Oe() {
  u.handle(
    "deleteTranslation",
    async (r, e, n, t) => {
      try {
        const o = E.join(n, `${t}.json`);
        if (!d.existsSync(o))
          throw new Error(`The file ${o} does not exist.`);
        const {
          dictionaryFilePath: i,
          legacyGraphFilePath: a,
          translations: s,
          changed: c
        } = b(n, t);
        let l = s.filter((f) => f.uuid !== e), g = c || l.length !== s.length;
        return l = l.map((f) => {
          var y;
          return (y = f.linkedWordIds) != null && y.includes(e) ? (g = !0, {
            ...f,
            linkedWordIds: f.linkedWordIds.filter((w) => w !== e)
          }) : f;
        }), I(l) && (g = !0), g && O(i, l), k(a), F("graph-changed", {
          route: n,
          name: t
        }), F("app-data-changed"), { success: !0, message: "Translation deleted successfully." };
      } catch (o) {
        throw console.error("Error deleting translation:", o), new Error(`Failed to delete translation. ${o}`);
      }
    }
  );
}
function ke(r) {
  P.existsSync(r) && P.rmSync(r, { recursive: !0, force: !0 });
}
function Ne() {
  u.handle(
    "deleteDictionary",
    async (r, e) => {
      try {
        const n = await $();
        if (!n.dictionaries || !n.dictionaries[e])
          throw new Error(`Dictionary with id "${e}" not found in config.`);
        const t = n.dictionaries[e], o = h.resolve(t.route);
        if (!P.existsSync(o) || !P.statSync(o).isDirectory())
          throw new Error(`Dictionary folder does not exist: ${o}`);
        return ke(o), delete n.dictionaries[e], await x(n), F("app-data-changed"), {
          success: !0,
          deletedId: e,
          deletedPath: o
        };
      } catch (n) {
        throw console.error("❌ Error deleting dictionary:", n), new Error("Failed to delete dictionary.");
      }
    }
  );
}
function $e() {
  u.handle(
    "renameDictionary",
    async (r, e, n) => {
      try {
        const t = await $();
        if (!t.dictionaries || !t.dictionaries[e])
          throw new Error(`Dictionary with id "${e}" not found in config.`);
        if (!n || n.trim() === "")
          throw new Error("Dictionary name cannot be empty.");
        return t.dictionaries[e].name = n.trim(), await x(t), F("app-data-changed"), {
          success: !0,
          dictId: e,
          newName: n.trim()
        };
      } catch (t) {
        throw console.error("❌ Error renaming dictionary:", t), new Error("Failed to rename dictionary.");
      }
    }
  );
}
function De() {
  u.handle("loadConfig", async () => {
    try {
      return await $();
    } catch (r) {
      throw console.error("Error reading JSON file:", r), new Error("Failed to load JSON file.");
    }
  });
}
function be() {
  u.handle("loadTranslations", async (r, e, n) => {
    try {
      const t = E.join(e, `${n}.json`);
      if (!d.existsSync(t))
        return [];
      const o = d.readFileSync(t, "utf-8"), i = JSON.parse(o || "[]");
      return Array.isArray(i) ? i : [];
    } catch (t) {
      return console.error("Error reading JSON file:", t), [];
    }
  });
}
async function Q(r, e) {
  await v.mkdir(e, { recursive: !0 });
  const n = await v.readdir(r, { withFileTypes: !0 });
  for (const t of n) {
    const o = h.join(r, t.name), i = h.join(e, t.name);
    t.isDirectory() ? await Q(o, i) : await v.copyFile(o, i);
  }
}
const xe = (r) => v.rm(r, { recursive: !0, force: !0 });
function Te() {
  u.handle(
    "moveDictionary",
    async (r, e, n) => {
      try {
        const t = await $();
        if (!t.dictionaries || !t.dictionaries[e])
          throw new Error(`Dictionary with id "${e}" not found in config.`);
        const i = t.dictionaries[e].route, a = h.resolve(i), s = h.resolve(n), c = await v.stat(a).catch(() => null);
        if (!(c != null && c.isDirectory()))
          throw new Error(`Source folder does not exist or is not a directory: ${a}`);
        const l = await v.stat(s).catch(() => null);
        if (!(l != null && l.isDirectory()))
          throw new Error(`Destination folder does not exist or is not a directory: ${s}`);
        const g = h.basename(a), f = h.join(s, g), y = (p, j) => {
          const S = h.relative(p, j);
          return !!S && !S.startsWith("..") && !h.isAbsolute(S);
        };
        if (a === f)
          return { success: !0, oldRoute: a, newRoute: f };
        if (y(a, f))
          throw new Error("Cannot move a folder into one of its own subdirectories.");
        if (await v.stat(f).catch(() => null))
          throw new Error(
            `A folder named "${g}" already exists at the destination (${f}).`
          );
        let w = !1;
        try {
          await v.rename(a, f), w = !0;
        } catch (p) {
          if (typeof p == "object" && p !== null && "code" in p && p.code === "EXDEV")
            await Q(a, f), await xe(a), w = !0;
          else
            throw p;
        }
        if (!w)
          throw new Error("Failed to move dictionary folder for unknown reasons.");
        return t.dictionaries[e].route = f, await x(t), F("app-data-changed"), {
          success: !0,
          oldRoute: a,
          newRoute: f
        };
      } catch (t) {
        throw console.error("❌ Error moving dictionary:", t), new Error("Failed to move dictionary.");
      }
    }
  );
}
function Ce() {
  u.handle("selectFolder", async () => {
    try {
      const r = await ee.showOpenDialog({
        properties: ["openDirectory"]
      });
      return r.canceled ? null : r.filePaths[0];
    } catch (r) {
      throw console.error("Error selecting folder:", r), new Error("Failed to select folder.");
    }
  });
}
function We() {
  u.handle("fetchGraph", async (r, e, n, t) => {
    try {
      const o = M(e, n);
      if (!d.existsSync(o))
        return t ? {} : {};
      const {
        dictionaryFilePath: i,
        legacyGraphFilePath: a,
        translations: s,
        changed: c
      } = b(e, n);
      c && O(i, s), k(a);
      const l = ge(s);
      return t ? l[t] || {} : l;
    } catch (o) {
      throw console.error("Error reading JSON file:", o), new Error("Failed to load JSON file.");
    }
  });
}
function Ae() {
  u.handle(
    "saveGraph",
    async (r, e, n, t, o) => {
      try {
        const {
          dictionaryFilePath: i,
          legacyGraphFilePath: a,
          translations: s,
          changed: c
        } = b(e, n), l = t == null ? void 0 : t.uuid, g = o == null ? void 0 : o.uuid;
        if (!l || !g)
          throw new Error("Both origin and destination ids are required.");
        if (l === g)
          return c && O(i, s), k(a), { success: !0 };
        const f = s.find((W) => W.uuid === l), y = s.find(
          (W) => W.uuid === g
        );
        if (!f || !y)
          throw new Error("Could not find one of the requested words.");
        const w = new Set(f.linkedWordIds ?? []), p = new Set(y.linkedWordIds ?? []), j = !w.has(g), S = !p.has(l);
        return w.add(g), p.add(l), f.linkedWordIds = Array.from(w).sort(), y.linkedWordIds = Array.from(p).sort(), (c || j || S) && O(i, s), k(a), F("graph-changed", { route: e, name: n }), console.log("Graph saved successfully"), { success: !0 };
      } catch (i) {
        throw console.error("Error saving graph:", i), new Error("Failed to save graph.");
      }
    }
  );
}
function Re() {
  u.handle(
    "deleteGraphEntry",
    async (r, e, n, t, o) => {
      var i, a;
      try {
        const {
          dictionaryFilePath: s,
          legacyGraphFilePath: c,
          translations: l,
          changed: g
        } = b(e, n), f = t == null ? void 0 : t.uuid, y = o == null ? void 0 : o.uuid;
        if (!f || !y)
          throw new Error("Both origin and destination ids are required.");
        const w = l.find((S) => S.uuid === f), p = l.find(
          (S) => S.uuid === y
        );
        let j = g;
        return (i = w == null ? void 0 : w.linkedWordIds) != null && i.includes(y) && (w.linkedWordIds = w.linkedWordIds.filter(
          (S) => S !== y
        ), j = !0), (a = p == null ? void 0 : p.linkedWordIds) != null && a.includes(f) && (p.linkedWordIds = p.linkedWordIds.filter(
          (S) => S !== f
        ), j = !0), j && O(s, l), k(c), F("graph-changed", { route: e, name: n }), console.log("Graph entry deleted successfully"), { success: !0 };
      } catch (s) {
        throw console.error("Error deleting graph entry:", s), new Error("Failed to delete graph entry.");
      }
    }
  );
}
function Ie() {
  u.handle(
    "saveUserPreferences",
    async (r, e) => {
      try {
        const t = { ...await K(), ...e };
        return console.log(e), await Pe(t), F("app-data-changed"), t;
      } catch (n) {
        throw console.error("Error saving user preferences file:", n), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function Je() {
  u.handle("loadUserPreferences", async () => {
    try {
      return await K();
    } catch (r) {
      throw console.error("Error reading user preferences file:", r), new Error("Failed to load user preferences file.");
    }
  });
}
function Ue() {
  u.handle(
    "editConfig",
    async (r, e) => {
      try {
        const t = { ...await $(), ...e };
        return await x(t), F("app-data-changed"), t;
      } catch (n) {
        throw console.error("Error saving user preferences file:", n), new Error("Failed to save user preferences file.");
      }
    }
  );
}
function _e() {
  u.handle("fetchNoteIndex", async (r, e, n) => {
    try {
      const t = e.replace(/\\/g, "/"), o = E.join(
        t,
        `NOTES-${n}`,
        `NOTES-INDEX-${n}.json`
      );
      d.existsSync(o) || (d.mkdirSync(E.dirname(o), { recursive: !0 }), d.writeFileSync(o, JSON.stringify([], null, 2), "utf-8"));
      const i = d.readFileSync(o, "utf-8");
      return JSON.parse(i);
    } catch (t) {
      throw console.error("Error reading markdown file:", t), new Error(`Failed to load markdown file: ${t}`);
    }
  });
}
function Le() {
  u.handle(
    "saveNoteIndex",
    async (r, e, n, t) => {
      try {
        const o = e.replace(/\\/g, "/"), i = E.join(
          o,
          `NOTES-${n}`,
          `NOTES-INDEX-${n}.json`
        );
        return d.writeFileSync(i, JSON.stringify(t, null, 2), "utf-8"), F("notes-changed", {
          route: o,
          name: n
        }), { success: !0, path: i };
      } catch (o) {
        throw console.error("Error saving JSON file:", o), new Error(`Failed to save JSON file: ${o}`);
      }
    }
  );
}
function ze() {
  u.handle("saveNotes", async (r, e, n, t, o) => {
    try {
      if (typeof e != "string" || typeof n != "string")
        throw new Error("Invalid note route/name.");
      if (typeof t != "string" || !t.trim())
        return { success: !1, error: "Invalid note id." };
      const i = e.replace(/\\/g, "/"), a = E.join(
        i,
        `NOTES-${n}`,
        `${t}.json`
      ), s = E.dirname(a);
      d.mkdirSync(s, { recursive: !0 });
      const c = o && typeof o == "object" ? o : { type: "doc", content: [] };
      return d.writeFileSync(a, JSON.stringify(c, null, 2), "utf-8"), F("notes-changed", {
        route: i,
        name: n,
        uuid: t
      }), { success: !0, path: a };
    } catch (i) {
      throw console.error("Error saving markdown file:", i), new Error(`Failed to save markdown file: ${i}`);
    }
  });
}
function Ge() {
  u.handle("fetchNotes", async (r, e, n, t) => {
    try {
      const o = e.replace(/\\/g, "/"), i = E.join(
        o,
        `NOTES-${n}`,
        `${t}.json`
      );
      if (!d.existsSync(i))
        return { type: "doc", content: [] };
      const a = d.readFileSync(i, "utf-8");
      try {
        return JSON.parse(a);
      } catch {
        return { type: "doc", content: [] };
      }
    } catch (o) {
      return console.error("Error reading note file:", o), { type: "doc", content: [] };
    }
  });
}
function Me() {
  u.handle("window-minimize", () => {
    const r = N.getFocusedWindow();
    r == null || r.minimize();
  });
}
function qe() {
  u.handle("window-maximize", () => {
    const r = N.getFocusedWindow();
    r && (r.isMaximized() ? r.unmaximize() : r.maximize());
  });
}
function Ve() {
  u.handle("window-close", () => {
    const r = N.getFocusedWindow();
    r == null || r.close();
  });
}
function Be(r) {
  if (typeof r != "string") return;
  const e = r.trim();
  if (e)
    return e.startsWith("/") ? e : `/${e}`;
}
function Ze() {
  u.handle("window-open-new", (r, e) => {
    R(Be(e), { hideSidebar: !0 });
  });
}
function He(r) {
  return Array.isArray(r) ? r.map((e) => {
    if (typeof e != "object" || e === null) return null;
    const n = "role" in e ? e.role : void 0, t = "content" in e ? e.content : void 0;
    return n !== "user" && n !== "assistant" || typeof t != "string" && typeof t != "object" ? null : { role: n, content: t };
  }).filter((e) => !!e) : [];
}
function Xe() {
  u.handle("chatSend", async (r, e) => {
    const n = He(e);
    if (n.length === 0)
      throw new Error("No messages provided.");
    const t = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: n })
    });
    if (!t.ok) {
      const i = await t.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${t.status}: ${i}`
      );
    }
    const o = await t.json().catch(() => null);
    if (!o || typeof o != "object")
      throw new Error("Empty response from local API.");
    return o;
  });
}
function Ke(r) {
  if (typeof r != "string") return null;
  const e = r.trim();
  return e.length > 0 ? e : null;
}
function Qe() {
  u.handle("chatConfig", async (r, e) => {
    const n = Ke(e);
    if (!n)
      throw new Error("A dictionary language is required.");
    const t = [
      {
        role: "user",
        content: {
          prompt: `Generate dictionary configuration for the language: "${n}".`,
          details: "Return JSON only. All labels must be in the target language's autonym, never the label language. For articles: provide non-empty definite article for each gender × number pair.",
          context: {
            requestedLanguageLabel: n
          }
        }
      }
    ], o = await fetch("http://localhost:3000/api/chat/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: t })
    });
    if (!o.ok) {
      const a = await o.text().catch(() => "");
      throw new Error(
        `Local API request failed with status ${o.status}: ${a}`
      );
    }
    const i = await o.json().catch(() => null);
    if (!i || typeof i != "object")
      throw new Error("Empty response from local API.");
    return i;
  });
}
function Ye(r) {
  const e = process.env[r];
  if (typeof e != "string") return;
  const n = e.trim();
  return n.length > 0 ? n : void 0;
}
function er() {
  return Ye("DELETE_ACCOUNT_ENDPOINT") ?? "http://localhost:3000/api/delete-account";
}
function rr() {
  u.handle("deleteAccount", async (r, e) => {
    if (typeof e != "string" || e.trim().length === 0)
      throw new Error("Missing Supabase access token.");
    try {
      const n = e.trim(), t = er(), o = await fetch(t, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${n}`
        },
        body: JSON.stringify({ accessToken: n })
      });
      if (!o.ok) {
        const a = await o.text().catch(() => "");
        throw new Error(
          `Delete account endpoint failed with status ${o.status}${a ? `: ${a}` : ""}`
        );
      }
      const i = await o.json().catch(() => null);
      if (i && typeof i == "object" && "success" in i && i.success === !1) {
        const a = "message" in i && typeof i.message == "string" ? i.message : "Delete account endpoint returned success=false.";
        throw new Error(a);
      }
      return i && typeof i == "object" ? i : { success: !0 };
    } catch (n) {
      const t = n instanceof Error ? n.message : "Failed to delete account.";
      throw console.error("❌ Error deleting account via backend endpoint:", t), new Error(t);
    }
  });
}
function nr() {
  be(), pe(), Oe(), je(), Te(), Ne(), $e(), Ce(), De(), Ue(), ae(), se(), oe(), ie(), We(), Ae(), Re(), Ie(), Je(), _e(), Le(), ze(), Ge(), Xe(), Qe(), rr(), Me(), qe(), Ve(), Ze();
}
function tr(r) {
  const e = {};
  for (const n of r.split(/\r?\n/)) {
    const t = n.trim();
    if (!t || t.startsWith("#")) continue;
    const o = t.indexOf("=");
    if (o <= 0) continue;
    const i = t.slice(0, o).trim();
    let a = t.slice(o + 1).trim();
    i && ((a.startsWith('"') && a.endsWith('"') || a.startsWith("'") && a.endsWith("'")) && (a = a.slice(1, -1)), a && (e[i] = a));
  }
  return e;
}
async function or(r) {
  try {
    const e = await v.readFile(r, "utf-8");
    return tr(e);
  } catch (e) {
    return typeof e == "object" && e !== null && "code" in e && e.code === "ENOENT", null;
  }
}
async function ir() {
  const r = [
    h.join(process.cwd(), ".env"),
    h.join(process.cwd(), ".env.local"),
    process.env.APP_ROOT ? h.join(process.env.APP_ROOT, ".env") : null,
    process.env.APP_ROOT ? h.join(process.env.APP_ROOT, ".env.local") : null
  ].filter((e) => !!e);
  for (const e of r) {
    const n = await or(e);
    if (n)
      for (const [t, o] of Object.entries(n))
        process.env[t] || (process.env[t] = o);
  }
}
D.on("window-all-closed", () => {
  process.platform !== "darwin" && D.quit();
});
D.on("activate", () => {
  N.getAllWindows().length === 0 && R();
});
D.whenReady().then(async () => {
  await ir(), nr(), R();
});
