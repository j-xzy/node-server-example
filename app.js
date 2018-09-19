const config = require('./config');
const Oka = require('./oka');
const serve = require('./middleware/serve');
const bodyParser = require('./middleware/bodyParse');
const fs = require('fs');

const oka = new Oka();
const database = {
  user: []
};

oka.use('/', (req, res, next) => {
  if (!req.cookie.username) {
    res.end(fs.readFileSync('./static/sign.html'));
  } else {
    next();
  }
});

oka.use('/index.html', (req, res) => {
  res.end('404');
});

oka.use('/sign.html', (req, res) => {
  res.end('404');
});

oka.use(serve(config.static, { index: 'index.html' }));

// 解析body
oka.use(bodyParser());

// 
oka.post('/signin', (req, res) => {
  if (!req.cookie.username) {
    // fs.createReadStream('./static/signup.html').pipe(res);
  } else {
    res.redirect('/');
  }
});

// 注册
oka.post('/register', (req, res) => {
  database.user.push({ ...req.body });
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  res.redirect('/');
});

// 404
oka.use((req, res) => {
  if(!req.finished) {
    res.end('404');
  }
});

oka.listen(config.port);
