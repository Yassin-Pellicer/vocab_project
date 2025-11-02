"use strict";
const electron = require("electron");
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
  selectFolder: async () => {
    return await electron.ipcRenderer.invoke("selectFolder");
  },
  loadConfig: async () => {
    return await electron.ipcRenderer.invoke("loadConfig");
  }
};
const endpoints = Object.assign(
  {},
  translations
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
