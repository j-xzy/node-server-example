/**
 * 静态资源中间件
 */

const fs = require('fs');
const path = require('path');

/**
 * 静态资源
 * @param {string} root 
 */
module.exports = function serve(root, opt) {
  return (req, res, next) => {
    if (res.finished || req.method !== 'GET') {
      return next();
    }
    let base = req.url;
    base === '/' && (base = opt.index);

    const assetsPath = path.join(root, base);
    fs.stat(assetsPath, (err, stats) => {
      if (err) {
        return next();
      }
      if (stats.isDirectory()) {
        return next();
      }

      // 设置header
      res.setHeader('Cache-control', 'public, no-cache');
      res.setHeader('Last-Modified', stats.mtime);
      res.setHeader('ETag', getEtag(stats));

      // 判断资源是否更改
      if (req.headers["if-none-match"] !== getEtag(stats)) {
        // 资源已被更改
        res.statusCode = '200';
        return res.end(fs.readFileSync(assetsPath));
      }

      // 资源未更改,浏览器已缓存
      res.statusCode = '304';
      return res.end();
    });
  }
}

function getEtag(stats) {
  return `${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}`;
}
