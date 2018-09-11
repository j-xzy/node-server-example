const http = require('http');
const config = require('./config');
const serve = require('./middleware/serve')(config.static);
const bodyParser = require('./middleware/bodyParse')();

// 创建服务
const server = http.createServer(async (req, res) => {
  // 静态资源
  serve(req, res);

  // 解析body
  await bodyParser(req, res);

  

});

// 启动监听
server.listen(config.port, () => {
  console.log(`listen on ${config.port}`);
});
