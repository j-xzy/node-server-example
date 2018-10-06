const mysql = require('tiny-sql');
const fs = require('fs');
const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');
const Query = require('./query');

// 创建连接实例
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'WOSHI3521',
  database: 'node-server-example'
});

const query = new Query(connection);

// 连接数据库
connection.connect();

// 创建oka实例
const oka = new Oka();

// 临时数据库
const database = {
  user: new Map()
};

// 解析body
oka.use(bodyParser());

oka.get('/', (req, res) => {
  if (req.cookie.username) {
    // 已经登录
    fs.createReadStream('./static/index.html').pipe(res);
  } else {
    // 未登录
    fs.createReadStream('./static/sign.html').pipe(res);
  }
});

oka.get('/index.html', (req, res) => {
  res.noFound();
});

oka.get('/sign.html', (freq, res) => {
  res.noFound();
});

// 静态资源
oka.use(serve(config.static));

// 登录
oka.post('/login', async (req, res) => {
  if (!await query.validate(req.body.username, req.body.password)) {
    // 用户不存在或密码错误
    return res.json({
      code: 0,
      msg: '用户不存在或密码错误',
      data: {}
    })
  }

  // 登录成功
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  return res.json({
    code: 1,
    msg: '登录成功',
    data: {}
  });
});

// 注册
oka.post('/register', async (req, res) => {
  if (await query.existUser(req.body.username)) {
    // 用户已经存在
    return res.json({
      code: 0,
      msg: '用户已经存在',
      data: {}
    });
  }

  // 新注册用户
  await query.addUser(req.body.username, req.body.password);
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  res.json({
    code: 1,
    msg: '注册成功',
    data: {}
  });
});

// 404
oka.use((req, res) => {
  if (!req.finished) {
    res.noFound();
  }
});

oka.listen(config.port);
