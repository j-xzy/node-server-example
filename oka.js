const http = require('http');

class Oka {
  constructor() {
    this.middlewares = [this.firstMiddleware];
  }

  firstMiddleware(req, res, next) {
    // 挂载重定向
    res.redirect = (url) => {
      res.statusCode = '302';
      res.setHeader('Location', url);
      res.end();
    }

    // 发送json
    res.json = function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    }

    res.noFound = function () {
      res.statusCode = 404;
      res.end('404');
    }

    // 解析cookie
    req.cookie = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach((item) => {
        req.cookie[item.split('=')[0].trim()] = item.split('=')[1];
      });
    }

    next();
  }

  get(url, middleware) {
    this.use(url, (req, res, next) => {
      if (req.method === 'GET') {
        middleware(req, res, next);
      } else {
        next();
      }
    });
  }

  post(url, middleware) {
    this.use(url, (req, res, next) => {
      if (req.method === 'POST') {
        middleware(req, res, next);
      } else {
        next();
      }
    });
  }

  use(url, middleware) {
    if (!middleware) {
      middleware = url;
      this.middlewares.push(middleware);
    } else {
      this.middlewares.push((req, res, next) => {
        if (
          url.lastIndexOf('/*') !== -1
          && url.lastIndexOf('/*') === url.length - 2
        ) {
          if (req.url.indexOf(url.slice(0, url.lastIndexOf('/*'))) === 0) {
            return middleware(req, res, next);
          }
          return next();
        }

        if (url === req.url) {
          return middleware(req, res, next);
        } else {
          return next();
        }
      });
    }
  }

  callback() {
    const middlewares = this.middlewares;

    return function handleRequest(req, res) {
      dispath(0);

      function dispath(i) {
        if (i === middlewares.length) {
          return;
        }
        middlewares[i](req, res, dispath.bind(null, i + 1));
      }

    }
  }

  listen(port) {
    http.createServer(this.callback()).listen(port);
  }
}

module.exports = Oka;
