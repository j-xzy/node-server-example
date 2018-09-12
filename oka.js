const http = require('http');


class Oka {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  callback() {
    const middlewares = this.middlewares;
    return async function handleRequest(req, res) {
      for(let i = 0; i < middlewares.length; i++) {
        await middlewares[i](req, res)
      }
    }
  }

  listen(port) {
    http.createServer(this.callback()).listen(port);
  }

}

module.exports = Oka;
