const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');
const fs = require('fs');

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
  res.end('404');
});

oka.get('/sign.html', (req, res) => {
  res.end('404');
});

// 静态资源
oka.use(serve(config.static));

// 登录
oka.post('/login', (req, res) => {
  if (database.user.has(req.body.username)) {

    if (database.user.get(req.body.username) !== req.body.password) {
      return res.json({
        code: 0,
        msg: '密码错误',
        data: {}
      })
    }

    res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
    return res.json({
      code: 1,
      msg: '登录成功',
      data: {}
    })
  } else {
    res.json({
      code: 0,
      msg: '未注册',
      data: {}
    })
  }
});

// 注册
oka.post('/register', (req, res) => {
  if (database.user.has(req.body.username)) {
    // 用户已经存在
    return res.json({
      code: 0,
      msg: '用户已经存在',
      data: {}
    });
  }

  database.user.set(req.body.username, req.body.password);
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  res.json({
    code: 1,
    msg: '注册成功',
    data: {}
  })
});

// 404
oka.use((req, res) => {
  if (!req.finished) {
    res.end('404');
  }
});

oka.listen(config.port);
