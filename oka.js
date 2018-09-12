const http = require('http');


class Oka {
  constructor() {
    this.middlewares = [this.firstMiddleware];
  }

  firstMiddleware(req, res) {
    // 挂载重定向
    res.redirect = (url) => {
      res.statusCode = '302';
      res.setHeader('Location', url);
    }

    // 解析cookie
    req.cookie = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach((item) => {
        req.cookie[item.split('=')[0]] = item.split('=')[1];
      });
    }
  }

  get(url, middleware) {
    this.middlewares.push((req, res) => {
      if (req.method === 'GET' && url === req.url) {
        middleware(req, res);
      }
    });
  }

  post(url, middleware) {
    this.middlewares.push((req, res) => {
      if (req.method === 'POST' && url === req.url) {
        middleware(req, res);
      }
    });
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  callback() {
    const middlewares = this.middlewares;
    return async function handleRequest(req, res) {
      for (let i = 0; i < middlewares.length; i++) {
        await middlewares[i](req, res)
      }
    }
  }

  listen(port) {
    http.createServer(this.callback()).listen(port);
  }

}

module.exports = Oka;
