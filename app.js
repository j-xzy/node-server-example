const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');
const fs = require('fs');

const oka = new Oka();
const database = {
  user: []
};

// 静态资源服务
oka.get('/static/*', serve(config.static));

// 解析body
oka.use(bodyParser());

// 重定向
oka.get('/', (req, res) => {
  if (req.cookie.username) {
    res.redirect('/backend');
  } else {
    res.redirect('/signup');
  }
});

// backend
oka.get('/backend', (req, res) => {
  if (!req.cookie.username) {
    res.redirect('/signup');
  } else {
    fs.createReadStream('./static/backend.html').pipe(res);
  }
});

oka.get('/signup', (req, res) => {
  if (!req.cookie.username) {
    fs.createReadStream('./static/signup.html').pipe(res);
  } else {
    res.redirect('/backend');
  }
});

// 注册
oka.post('/register', (req, res) => {
  database.user.push({ ...req.body });
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  res.redirect('/backend');
});

oka.listen(config.port);
