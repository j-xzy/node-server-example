const Events = require('events');
const ShakePacket = require('../packets/shakePacket');
const ClientAuthenticationPacket = require('../packets/clientAuthenticationPacket');
const Auth = require('../auth');

class HandleShake extends Events {
  constructor(config) {
    super(config);
    this._config = config;
    this._isHandShake = false;
  }

  determinePacket(firstByte) {
    if (!this._isHandShake) {
      this._isHandShake = true;
      return ShakePacket;
    }
    return undefined;
  }

  ShakePacket(packet) {
    this._handshakeInitializationPacket = packet;
    this._sendCredentials();
  }

  OkPacket() {
    this.emit('end');
  }

  start() {
    
  }

  _sendCredentials() {
    const packet = this._handshakeInitializationPacket;
    this.emit('packet', new ClientAuthenticationPacket({
      clientFlags: 455631,
      maxPacketSize: 0,
      charsetNumber: 33,
      user: this._config.user,
      database: this._config.database,
      protocol41: packet.protocol41,
      scrambleBuff: Auth.token(this._config.password, packet.scrambleBuff())
    }));
  };
}

module.exports = HandleShake;
