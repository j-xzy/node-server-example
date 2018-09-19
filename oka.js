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
        if (url.includes('*')) {
          let flag = true;

          let urls = url.slice(0, url.indexOf('*') - 1).split('/');
          urls.shift();

          let orginUrls = req.url.split('/');
          orginUrls.shift();

          for (let i = 0; i < urls.length; i++) {
            if (urls[i] !== orginUrls[i]) {
              flag = false;
            }
          }

          if (flag) {
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
