const path = require('path');

module.exports = {
  port: 3000, //　端口
  static: path.join(__dirname, 'view') // 静态资源目录
}
