export {};

declare global {
  interface Window {
    api: any
    ipcRenderer: any
  }
}
