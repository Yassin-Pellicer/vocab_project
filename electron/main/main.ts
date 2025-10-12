import { app, BrowserWindow } from 'electron'
import createWindow from './window/window'
import registerIpcHandlers from './ipc'

let win: BrowserWindow | null

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { 
    createWindow()
  }
})

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
})
