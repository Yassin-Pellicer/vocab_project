import { ipcMain, BrowserWindow } from "electron";

export default function maximizeWindow() {
  ipcMain.handle("window-maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}
