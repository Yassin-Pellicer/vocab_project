declare global {
  interface Window {
    api: import("./electron-api").RendererApi;
    ipcRenderer: import("./electron-api").IpcRendererLike;
  }
}

export {};
