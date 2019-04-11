// 被 webpack 和 node 主进程共享
// 用来指导计算打包资源和离线预缓存资源
// TODO: 添加webpack-plugin，以全局变量的方式注入到main进程的js中
// 暂时先这样
const klaw = require('klaw-sync');
const { join, relative, sep } = require('path');
const fs = require('fs-extra');

const PROJECT_DIR = __dirname;
const PROJECT_CONTENT_DIR = join(PROJECT_DIR, 'build');
const PROJECT_ASSETS_DIR = join(PROJECT_DIR, 'assets');
const render_dir = join(PROJECT_DIR, 'src', 'render');

function getRenderPages() {
  const items = klaw(join(render_dir, 'pages'), { nofile: true });
  return items
    .filter(item => {
      return fs.existsSync(join(item.path, 'index.js'));
    })
    .map(item => {
      return relative(render_dir, item.path);
    })
    .map(item => {
      const name = item.split(sep).join('/');
      const js = join(render_dir, item, 'index.js');
      const template = join(render_dir, item, 'index.html');
      return { name, js, template };
    });
}
// 读取静态资源目录
function getAssets() {
  const items = klaw(PROJECT_ASSETS_DIR, { nodir: true });
  return items
    .map(item => {
      return relative(PROJECT_ASSETS_DIR, item.path);
    })
    .map(item => {
      return `/static/${item.split(sep).join('/')}`;
    });
}
function getBuild() {
  const items = klaw(PROJECT_CONTENT_DIR, { nodir: true });
  return items
    .filter(item => {
      // 构建出来的东西，目前看应该只可能是这几种
      // 有其他类型再考虑
      return /\.(js|css|html)$/.test(item.path);
    })
    .map(item => {
      return relative(PROJECT_CONTENT_DIR, item.path);
    })
    .map(item => {
      return `/${item.split(sep).join('/')}`;
    });
}
// html, js, css 是预缓存列表
function getPreCacheList() {
  // 结合webpack的url配置，组装成为完整的带域名的 host
  // 于是就可以开启域名  + path 的更严谨的匹配模式了
  return getAssets().concat(getBuild());
}

module.exports = {
  PROJECT_DIR,
  PROJECT_CONTENT_DIR,
  PROJECT_ASSETS_DIR,
  getRenderPages,
  getPreCacheList
};
