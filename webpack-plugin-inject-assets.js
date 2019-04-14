// webpack 插件在合适的时机，将生成的静态资源列表注入 main 入口中
// 以供拦截逻辑使用，其实不是一个特别好的方法，因为业务很少用得到
const crypto = require("crypto");
const { getPreCacheList } = require("./resource");

function InjectAssetsPlugin(options) {}
function getAssetHash(asset) {
  return crypto
    .createHash("md5")
    .update(Buffer.from(asset.source()))
    .digest("hex");
}
function generateMetadataForAssets(assets, chunks) {
  const mapping = {};

  // Start out by getting metadata for all the assets associated with a chunk.
  for (const chunk of chunks) {
    for (const file of chunk.files) {
      mapping[file] = {
        chunkName: chunk.name,
        hash: chunk.renderedHash
      };
    }
  }

  // Next, loop through the total list of assets and find anything that isn't
  // associated with a chunk.
  for (const [file, asset] of Object.entries(assets)) {
    if (file in mapping) {
      continue;
    }

    mapping[file] = {
      // Just use an empty string to denote the lack of chunk association.
      chunkName: "",
      hash: getAssetHash(asset)
    };
  }

  return mapping;
}
function getKnownHashesFromAssets(assetMetadata) {
  const knownHashes = new Set();
  for (const metadata of Object.values(assetMetadata)) {
    knownHashes.add(metadata.hash);
  }
  return knownHashes;
}
function getEntry(knownHashes, url, revision) {
  // We're assuming that if the URL contains any of the known hashes
  // (either the short or full chunk hash or compilation hash) then it's
  // already revisioned, and we don't need additional out-of-band revisioning.
  if (!revision || knownHashes.some(hash => url.includes(hash))) {
    return { url };
  }
  return { revision, url };
}
function handleEmit(compilation) {
  const publicPath = compilation.options.output.publicPath;
  const { assets, chunks } = compilation;
  const assetsMetaData = generateMetadataForAssets(assets, chunks);

  const knownHashes = [
    compilation.hash,
    compilation.fullHash,
    ...getKnownHashesFromAssets(assetsMetaData)
  ].filter(hash => !!hash);

  const manifestEntries = [];
  for (const [file, metadata] of Object.entries(assetsMetaData)) {
    const publicURL = `${publicPath}${file}`;
    const manifestEntry = getEntry(knownHashes, publicURL, metadata.hash);
    manifestEntries.push(manifestEntry);
  }

  const staticAssets = getPreCacheList().map(item => `${publicPath}${item}`);
  console.log(staticAssets.concat(manifestEntries));
  return manifestEntries;
}

InjectAssetsPlugin.prototype.apply = function(compiler) {
  compiler.hooks.emit.tap("InjectAssetsPlugin", compilation => {
    handleEmit(compilation);
  });
};

module.exports = InjectAssetsPlugin;
