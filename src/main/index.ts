import { app } from 'electron';
import createWindow from './window';

let url = 'http://localhost:8080/pages/app.html';
let mainWindow;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  mainWindow = undefined;
});

app.on('ready', () => {
  mainWindow = createWindow(url, false);
});
