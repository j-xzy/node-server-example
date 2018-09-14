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
      res.end();
    }

    // 解析cookie
    req.cookie = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach((item) => {
        req.cookie[item.split('=')[0].trim()] = item.split('=')[1];
      });
    }
  }

  get(url, middleware) {
    this.use(url, (req, res) => {
      if (req.method === 'GET') {
        middleware(req, res);
      }
    });
  }

  post(url, middleware) {
    this.use(url, (req, res) => {
      if (req.method === 'POST') {
        middleware(req, res);
      }
    });
  }

  use(url, middleware) {
    if (!middleware) {
      middleware = url;
      this.middlewares.push(middleware);
    } else {
      this.middlewares.push((req, res) => {
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
            middleware(req, res);
          }

          return;
        }

        if (url === req.url) {
          return middleware(req, res);
        }
      });
    }
  }

  callback() {
    this.middlewares.push((req,res) => {
      if(!res.finished) {
        
      }
    });
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
