const Net = require('net');
const Protocol = require('./protocol');

/**
 * 创建连接
 * @param {{ host:string; port: number; password: string; user: string; database:string }} config 
 */
exports.createConnection = function createConnection(config) {
  return new Connection(config);
}

class Connection {
  constructor(config) {
    this._config = config;
  }

  /**
   * 连接数据库
   */
  connect() {
    this._protocol = new Protocol(this);
    // 创建socket
    this._socket = Net.createConnection(this._config.port, this._config.host);

    // 监听data事件
    this._socket.on('data', (data) => {
      this._protocol.write(data);
    });

    // 监听end事件
    this._socket.on('end', () => {
      //
    });

    this._protocol.on('data', (data) => {
      this._socket.write(data);
    });

    this._protocol.handshake(this._config);
  }

  /**
   * 执行sql
   * @param {string} sql 
   * @param {*} callback 
   */
  query(sql, callback) {
    this._protocol.query(sql, callback);
  }
}
