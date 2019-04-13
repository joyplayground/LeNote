import { InterceptBufferProtocolRequest, BrowserView } from 'electron';
import precachelist from './define';
import { join } from 'path';
import { parse } from 'url';
import { readFile } from 'fs';
function resolveCache(pathname) {
  // 基于 build 目录计算
  return join(__dirname, '..', pathname);
}

export default function withCache(request: InterceptBufferProtocolRequest, callback: (steam: Buffer) => void): void {
  const pathname = parse(request.url).pathname;

  const isMatch = precachelist.some(item => {
    return item === pathname;
  });
  const isAssets = pathname.startsWith('/static');
  if (isMatch) {
    let fullpath = resolveCache(join(isAssets ? 'assets/' : 'build/', pathname.replace('/static', '')));
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
