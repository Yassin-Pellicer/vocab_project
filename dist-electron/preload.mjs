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
  }
};
const endpoints = Object.assign(
  {},
  translations,
  markdown,
  conjugation,
  graph,
  config
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
