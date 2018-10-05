/**
 * 解析请求的body
 */

module.exports = function bodyParser() {
  return (req, res, next) => {
    // 不解析Get
    if (req.method === 'GET') {
      return next();
    }

    const data = [];

    req.on('data', (chunk) => {
      data.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(data);

      // json
      if (req.headers['content-type'].includes('application/json')) {
        req.body = JSON.parse(buffer);
      }

      // 字符串
      if (req.headers['content-type'].includes('text/plain')) {
        req.body = buffer.toString();
      }

      // 表单
      if (req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        req.body = {};
        buffer.toString().split('&').forEach((item) => {
          req.body[item.split('=')[0]] = item.split('=')[1];
        });
      }

      return next();
    });
  }
}
