<<<<<<< HEAD
"use strict";const r=require("electron"),o={moveDictionary:async(e,n)=>await r.ipcRenderer.invoke("moveDictionary",e,n)},c={fetchConjugation:async(e,n,i)=>await r.ipcRenderer.invoke("fetchConjugation",e,n,i),saveConjugation:async(e,n,i,a)=>await r.ipcRenderer.invoke("saveConjugation",e,n,i,a)},s={fetchGraph:async(e,n,i)=>await r.ipcRenderer.invoke("fetchGraph",e,n,i),saveGraph:async(e,n,i,a)=>await r.ipcRenderer.invoke("saveGraph",e,n,i,a),deleteGraphEntry:async(e,n,i,a)=>await r.ipcRenderer.invoke("deleteGraphEntry",e,n,i,a)},d={fetchMarkdown:async(e,n,i)=>await r.ipcRenderer.invoke("fetchMarkdown",e,n,i),saveMarkdown:async(e,n,i,a)=>await r.ipcRenderer.invoke("saveMarkdown",e,n,i,a)},p={fetchNotes:async(e,n,i)=>await r.ipcRenderer.invoke("fetchNotes",e,n,i),fetchNoteIndex:async(e,n)=>await r.ipcRenderer.invoke("fetchNoteIndex",e,n),saveNoteIndex:async(e,n,i)=>await r.ipcRenderer.invoke("saveNoteIndex",e,n,i),saveNotes:async(e,n,i,a)=>await r.ipcRenderer.invoke("saveNotes",e,n,i,a)},v={requestTranslations:async(e,n)=>await r.ipcRenderer.invoke("loadTranslations",e,n),addTranslation:async(e,n,i,a)=>await r.ipcRenderer.invoke("addTranslation",e,n,i,a),deleteTranslation:async(e,n,i)=>await r.ipcRenderer.invoke("deleteTranslation",e,n,i),createDictionary:async(e,n)=>await r.ipcRenderer.invoke("createDictionary",e,n),moveDictionary:async(e,n)=>await r.ipcRenderer.invoke("moveDictionary",e,n),deleteDictionary:async e=>await r.ipcRenderer.invoke("deleteDictionary",e),renameDictionary:async(e,n)=>await r.ipcRenderer.invoke("renameDictionary",e,n),selectFolder:async()=>await r.ipcRenderer.invoke("selectFolder"),loadConfig:async()=>await r.ipcRenderer.invoke("loadConfig"),saveUserPreferences:async e=>await r.ipcRenderer.invoke("saveUserPreferences",e),loadUserPreferences:async()=>await r.ipcRenderer.invoke("loadUserPreferences"),editConfig:async e=>await r.ipcRenderer.invoke("editConfig",e)},w={minimize:async()=>await r.ipcRenderer.invoke("window-minimize"),maximize:async()=>await r.ipcRenderer.invoke("window-maximize"),close:async()=>await r.ipcRenderer.invoke("window-close"),openNewWindow:async e=>await r.ipcRenderer.invoke("window-open-new",e)},u=Object.assign({},v,d,c,s,o,p,w);r.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[n,i]=e;return r.ipcRenderer.on(n,(a,...t)=>i(a,...t))},off(...e){const[n,...i]=e;return r.ipcRenderer.off(n,...i)},send(...e){const[n,...i]=e;return r.ipcRenderer.send(n,...i)},invoke(...e){const[n,...i]=e;return r.ipcRenderer.invoke(n,...i)}});r.contextBridge.exposeInMainWorld("api",u);
=======
"use strict";
const electron = require("electron");
const config = {
  moveDictionary: async (dictId, newRoute) => {
    return await electron.ipcRenderer.invoke("moveDictionary", dictId, newRoute);
  }
};
const conjugation = {
  fetchConjugation: async (route, name, uuid) => {
    return await electron.ipcRenderer.invoke("fetchConjugation", route, name, uuid);
  },
  saveConjugation: async (route, name, uuid, conjugation2) => {
    return await electron.ipcRenderer.invoke("saveConjugation", route, name, uuid, conjugation2);
  }
};
const graph = {
  fetchGraph: async (route, name, uuid) => {
    return await electron.ipcRenderer.invoke("fetchGraph", route, name, uuid);
  },
  saveGraph: async (route, name, origin, destination) => {
    return await electron.ipcRenderer.invoke("saveGraph", route, name, origin, destination);
  },
  deleteGraphEntry: async (route, name, origin, destination) => {
    return await electron.ipcRenderer.invoke("deleteGraphEntry", route, name, origin, destination);
  }
};
const markdown = {
  fetchMarkdown: async (route, name, uuid) => {
    return await electron.ipcRenderer.invoke("fetchMarkdown", route, name, uuid);
  },
  saveMarkdown: async (route, name, uuid, markdown2) => {
    return await electron.ipcRenderer.invoke("saveMarkdown", route, name, uuid, markdown2);
  }
};
const notes = {
  fetchNotes: async (route, name, uuid) => {
    return await electron.ipcRenderer.invoke("fetchNotes", route, name, uuid);
  },
  fetchNoteIndex: async (route, name) => {
    return await electron.ipcRenderer.invoke("fetchNoteIndex", route, name);
  },
  saveNoteIndex: async (route, name, currentConfig) => {
    return await electron.ipcRenderer.invoke(
      "saveNoteIndex",
      route,
      name,
      currentConfig
    );
  },
  saveNotes: async (route, name, uuid, content) => {
    return await electron.ipcRenderer.invoke("saveNotes", route, name, uuid, content);
  }
};
const translations = {
  requestTranslations: async (route, name) => {
    return await electron.ipcRenderer.invoke("loadTranslations", route, name);
  },
  addTranslation: async (entry, word, route, name) => {
    return await electron.ipcRenderer.invoke("addTranslation", entry, word, route, name);
  },
  deleteTranslation: async (word, route, name) => {
    return await electron.ipcRenderer.invoke("deleteTranslation", word, route, name);
  },
  createDictionary: async (route, name) => {
    return await electron.ipcRenderer.invoke("createDictionary", route, name);
  },
  moveDictionary: async (dictId, newRoute) => {
    return await electron.ipcRenderer.invoke("moveDictionary", dictId, newRoute);
  },
  deleteDictionary: async (dictId) => {
    return await electron.ipcRenderer.invoke("deleteDictionary", dictId);
  },
  renameDictionary: async (dictId, newName) => {
    return await electron.ipcRenderer.invoke("renameDictionary", dictId, newName);
  },
  selectFolder: async () => {
    return await electron.ipcRenderer.invoke("selectFolder");
  },
  loadConfig: async () => {
    return await electron.ipcRenderer.invoke("loadConfig");
  },
  saveUserPreferences: async (config2) => {
    return await electron.ipcRenderer.invoke("saveUserPreferences", config2);
  },
  loadUserPreferences: async () => {
    return await electron.ipcRenderer.invoke("loadUserPreferences");
  },
  editConfig: async (newConfig) => {
    return await electron.ipcRenderer.invoke("editConfig", newConfig);
  }
};
const windowControls = {
  minimize: async () => {
    return await electron.ipcRenderer.invoke("window-minimize");
  },
  maximize: async () => {
    return await electron.ipcRenderer.invoke("window-maximize");
  },
  close: async () => {
    return await electron.ipcRenderer.invoke("window-close");
  },
  openNewWindow: async (route) => {
    return await electron.ipcRenderer.invoke("window-open-new", route);
  }
};
const chat = {
  chatSend: async (messages) => {
    return await electron.ipcRenderer.invoke("chatSend", messages);
  }
};
const endpoints = Object.assign(
  {},
  translations,
  markdown,
  conjugation,
  graph,
  config,
  notes,
  windowControls,
  chat
);
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("api", endpoints);
>>>>>>> dd30e28 (config done)
