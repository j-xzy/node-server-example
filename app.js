const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');

const oka = new Oka();
const database = {
  user: []
};

// 静态资源服务
oka.use(serve(config.static));

// 解析body
oka.use(bodyParser());

// 重新定向
oka.get('/', (req, res) => {
  if (req.cookie.username) {
    res.redirect('/home.html');
  } else {
    res.redirect('/signup.html');
  }
  res.end();
});

// home
oka.get('/home.html', (req, res) => {
  if (!req.cookie.username) {
    res.end('没有权限');
  }
});

// 登录
oka.post('/login', (req, res) => {
  debugger
});

// 注册
oka.post('/register', (req, res) => {
  database.user.push({ ...req.body });
  res.setHeader('Set-Cookie', [`username= ${req.body.username}`]);
  res.redirect('/home.html');
  res.end();
});



oka.listen(config.port);
