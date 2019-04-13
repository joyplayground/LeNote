import { app, globalShortcut, BrowserWindow } from 'electron';
import createWindow from './window';

let url = 'http://localhost:8080/pages/app.html';
let mainWindow: BrowserWindow;

function registerOpenDevTools() {
  globalShortcut.register('Ctrl+Alt+I', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
    }
  });
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  globalShortcut.unregisterAll();
  mainWindow = undefined;
});

app.on('ready', () => {
  mainWindow = createWindow(url, false);
  registerOpenDevTools();
});
