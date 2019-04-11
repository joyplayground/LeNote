const path = require('path');
const fs = require('fs-extra');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const resource = require('./resource');
const webpack = require('webpack');

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const isProd = mode === 'production';
const output_dir = path.join(__dirname, 'build');
const render_dir = path.join(__dirname, 'src', 'render');

const common_config = {
  mode,
  output: {
    path: output_dir,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.css', '.json', '.html']
  },
  devtool: isProd ? 'source-map' : 'inline-source-map',
  devServer: {
    contentBase: output_dir,
    hot: true
  },
  // 阻止 webpack 自定义的实现
  node: {
    console: false,
    global: false,
    process: false,
    __filename: false,
    __dirname: false,
    Buffer: false,
    setImmediate: false
  }
};
// 管理 render 独立页面

function getRenderEntry() {
  const entry = {};
  resource.getRenderPages().forEach(page => {
    entry[page.name] = page.js;
  });
  return entry;
}
console.log(resource.getPreCacheList());
module.exports = [
  {
    ...common_config,
    target: 'electron-main',
    entry: {
      app: './src/main/index.ts'
    },
    plugins: [new webpack.DefinePlugin({
      '__DEFINE_PRECACHE_LIST': JSON.stringify(resource.getPreCacheList())
    })]
  },
  {
    ...common_config,
    target: 'electron-renderer',
    entry: getRenderEntry(),
    plugins: [
      ...resource.getRenderPages().map(page => {
        return new HTMLWebpackPlugin({
          filename: `${page.name}.html`,
          template: page.template,
          chunks: [page.name],
          minify: isProd
        });
      })
    ]
  }
];
