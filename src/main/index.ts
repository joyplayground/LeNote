import { app, BrowserWindow, protocol, InterceptBufferProtocolRequest, BrowserView, WebPreferences } from 'electron';
import { join } from 'path';
import { parse } from 'url';
import { readFile } from 'fs';
import precachelist from './define';
import { WSAEINTR } from 'constants';

function resolveCache(pathname) {
  // 基于 build 目录计算
  return join(__dirname, '..', pathname);
}

const memCache = {};

// 通过 webRequest 拦截网络请求，从而实现离线在线的转换控制呢?
function withCache(request: InterceptBufferProtocolRequest, callback: (steam: Buffer) => void): void {
  const pathname = parse(request.url).pathname;

  const isMatch = precachelist.some(item => {
    return item === pathname;
  });
  const isAssets = pathname.startsWith('/static');
  if (isMatch) {
    let fullpath = resolveCache(join(isAssets ? 'assets/' : 'build/', pathname.replace('/static', '')));
    console.log('fullpath', fullpath);
    readFile(
      fullpath,
      {
        flag: 'r',
        encoding: 'utf-8'
      },
      (error, data) => {
        if (error) {
          // TODO: should show 404?
          console.log('error', error);
        }
        callback(Buffer.from(data));
      }
    );
  }
}

const defaultSecurityWebPreferences: WebPreferences = {
  nodeIntegration: false,
  nodeIntegrationInSubFrames: false,
  nodeIntegrationInWorker: false
};

function createWindow() {
  protocol.interceptBufferProtocol('http', withCache);
  protocol.interceptBufferProtocol('https', withCache);
  // session.defaultSession.webRequest.onBeforeRequest(withCache);

  let win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: defaultSecurityWebPreferences
  });

  // let sideview = new BrowserView({
  //   webPreferences: {
  //     nodeIntegration: false,
  //     nodeIntegrationInSubFrames: false,
  //     nodeIntegrationInWorker: false
  //   }
  // });
  // sideview.webContents.loadURL('http://www.baidu.com/pages/app.html');
  // sideview.setAutoResize({ width: false, height: true });
  // win.addBrowserView(sideview);
  // // win.setBrowserView(sideview);
  // sideview.setBounds({ x: 0, y: 0, width: 120, height: 600 });

  let contentview = new BrowserView({
    webPreferences: defaultSecurityWebPreferences
  });
  contentview.webContents.loadURL('http://www.baidu.com/pages/editor.html');
  // contentview.setAutoResize({ width: true, height: true });
  // win.setBrowserView(contentview);
  win.addBrowserView(contentview);
  contentview.setBounds({ x: 120, y: 55, width: 680, height: 545 });
  
  // 因为有多个BrowserView，所以直接快捷键打开，有些问题，
  // TODO 找到更好的方式
  contentview.webContents.openDevTools();

  // let bottomView = new BrowserView({
  //   webPreferences: defaultSecurityWebPreferences
  // });

  // bottomView.webContents.loadURL('http://www.baidu.com/pages/app.html');
  // // bottomView.setAutoResize({ width: true, height: false });
  // // win.addBrowserView(contentview);
  // bottomView.setBounds({ x: 120, y: 500, width: 680, height: 100 });
  // win.addBrowserView(bottomView);

  contentview.webContents.on('dom-ready', () => {
    win.show();
  });
  // win.on('ready-to-show', () => {
  //   win.show();
  // })
  win.on('resize', () => {
    let bounds = win.getBounds();
    contentview.setBounds({ x: 120, y: 55, width: bounds.width - 120, height: bounds.height - 55 });
    // bottomView.setBounds({ x: 120, y: bounds.height - 100, width: bounds.width - 120, height: 100 });
  });

  win.on('close', () => {
    win = null;
  });
  console.log(win.getBrowserViews());
  // 分别构建 html 交给 renderer 构建，所以在目录层次上不能通过 require 接过来
  // 不过目录规律一定，可以通过约定的方式解决文件引入的问题
  // win.loadFile(resolvePageHtml('pages/app'));
  win.loadURL('http://www.baidu.com/pages/app.html');
}

app.on('ready', createWindow);
