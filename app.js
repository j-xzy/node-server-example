const mysql = require('./mysql');
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
  database: 'node_server_example'
});

const query = new Query(connection);

// 连接数据库
connection.connect();

// 创建oka实例
const oka = new Oka();

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
  await query.addUser(req.body.username, req.body.password, req.body.role);
  res.setHeader('Set-Cookie', [`username=${req.body.username}`]);
  res.json({
    code: 1,
    msg: '注册成功',
    data: {}
  });
});

//基本信息
oka.get('/info', async (req, res) => {
  if (!req.cookie.username) {
    return res.json({
      code: 0,
      msg: '未登录',
      data: {}
    })
  }
  const privilege = await query.privilege(req.cookie.username);
  const role = await query.role(req.cookie.username);
  res.json({
    code: 1,
    msg: '成功',
    data: {
      username: req.cookie.username,
      privilege,
      role
    }
  })
});

// 查询所有用户及角色
oka.get('/alluser', async (req, res) => {
  if (!req.cookie.username || req.cookie.username !== 'admin') {
    return res.json({
      code: 0,
      msg: '没有权限',
      data: {}
    })
  }
  const result = await query.allUser();
  res.json({
    code: 1,
    msg: '成功',
    data: result
  });
});

// 更改用户权限
oka.post('/updateRole', async (req, res) => {
  if (!req.cookie.username || req.cookie.username !== 'admin') {
    return res.json({
      code: 0,
      msg: '没有权限',
      data: {}
    })
  }
  const promises = [];
  for (let i = 0; i < req.body.length; i++) {
    promises.push(query.updateRole(req.body[i].name, req.body[i].roleId));
  }
  await Promise.all(promises);
  res.json({
    code: 1,
    msg: '更改成功',
    data: {}
  });
});

// 上传组件
oka.post('/uploadComp', async (req, res) => {
  const compId = await query.addComp(req.cookie.username, req.body.comp, req.body.status);
  res.json({
    code: 1,
    msg: '上传成功',
    data: {
      compId
    }
  });
});

// 查询公开组件
oka.get('/publicComp', async (req, res) => {
  const comp = await query.publicComp();
  res.json({
    code: 1,
    msg: '查询成功',
    data: comp
  });
});

// 查询我的组件
oka.get('/myComp', async (req, res) => {
  const comp = await query.compByUsername(req.cookie.username);
  res.json({
    code: 1,
    msg: '查询成功',
    data: comp
  })
});

// 删除组件
oka.post('/deleteComp', async (req ,res) => {
  const compId = req.body;
  await query.deleteComp(compId);
  res.json({
    code: 1,
    msg: '删除成功',
    data: {}
  })
});

// 下载组件
oka.get('/download', async (req, res) => {
  const content = await query.compById(req.params.id);
  res.end(content);
});

// 404
oka.use((req, res) => {
  if (!req.finished) {
    res.noFound();
  }
});

oka.listen(config.port);
