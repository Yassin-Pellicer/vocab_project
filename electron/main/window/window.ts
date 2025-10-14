import { BrowserWindow, Menu } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;


export default function createWindow() {
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  frame: true, // or false if you want custom frame
  transparent: true,
  hasShadow: false,
  titleBarStyle: "hiddenInset",
  icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
  webPreferences: {
    preload: path.join(__dirname, "preload.mjs"),
  },
});


  Menu.setApplicationMenu(null);

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
