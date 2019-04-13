import { BrowserWindow, protocol, WebPreferences, Menu, globalShortcut } from 'electron';
import withCache from './cache';
// 通过 webRequest 拦截网络请求，从而实现离线在线的转换控制呢?
const defaultSecurityWebPreferences: WebPreferences = {
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  nodeIntegrationInWorker: false,
  preload: 'http://localhost:8080/preload.js'
};

const CRASH_TIME_INTERVAL = 10 * 1000;

function createWindow(url: string, shouldCache: boolean): BrowserWindow {
  if (process.env.NODE_ENV === 'production' && shouldCache) {
    protocol.interceptBufferProtocol('http', withCache);
    protocol.interceptBufferProtocol('https', withCache);
  }

  let reload_time = 0,
    last_crash_time = 0;

  Menu.setApplicationMenu(null);

  let win = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    show: false,
    width: 800,
    height: 600,
    webPreferences: defaultSecurityWebPreferences
  });

  win.on('ready-to-show', () => {
    win.show();
  });

  win.webContents.on('crashed', () => {
    // 崩溃次数大于3此，或者连续崩溃间隔小于CRASH_TIME_INTERVAL
    if (reload_time > 3 || (last_crash_time && Date.now() - last_crash_time > CRASH_TIME_INTERVAL)) {
      console.error('[Crashed]');
      return;
    }

    reload_time++;
    last_crash_time = Date.now();
    win.webContents.reload();
  });

  win.on('closed', () => {
    win = null;
  });

  win.loadURL(url);

  return win;
}

export default createWindow;
