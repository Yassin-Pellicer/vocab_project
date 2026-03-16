import { app, BrowserWindow } from 'electron'
import createWindow from './window/window'
import registerIpcHandlers from './ipc'
import { loadEnvIfPresent } from "./env/load-env";

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { 
    createWindow()
  }
})

app.whenReady().then(() => {
  void loadEnvIfPresent();
  registerIpcHandlers()
  createWindow()
})
