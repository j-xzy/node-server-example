class ShakePacket {
  constructor() {
    this.protocolVersion = null;
    this.serverVersion = null;
    this.threadId = null;
    this.scrambleBuff1 = null;
    this.filler1 = null;
    this.serverCapabilities1 = null;
    this.serverLanguage = null;
    this.serverStatus = null;
    this.serverCapabilities2 = null;
    this.scrambleLength = null;
    this.filler2 = null;
    this.scrambleBuff2 = null;
    this.filler3 = null;
    this.pluginData = null;
    this.protocol41 = null;
  }

  parse(parser) {
    this.protocolVersion = parser.parseUnsignedNumber(1);
    this.serverVersion = parser.parseNullTerminatedString();
    this.threadId = parser.parseUnsignedNumber(4);
    this.scrambleBuff1 = parser.parseBuffer(8);
    this.filler1 = parser.parseBuffer(1);
    this.serverCapabilities1 = parser.parseUnsignedNumber(2);
    this.serverLanguage = parser.parseUnsignedNumber(1);
    this.serverStatus = parser.parseUnsignedNumber(2);

    this.protocol41 = (this.serverCapabilities1 & (1 << 9)) > 0;

    if (this.protocol41) {
      this.serverCapabilities2 = parser.parseUnsignedNumber(2);
      this.scrambleLength = parser.parseUnsignedNumber(1);
      this.filler2 = parser.parseBuffer(10);
      this.scrambleBuff2 = parser.parseBuffer(12);
      this.filler3 = parser.parseBuffer(1);
    } else {
      this.filler2 = parser.parseBuffer(13);
    }

    if (parser.reachedPacketEnd()) {
      return;
    }
  
    this.pluginData = parser.parsePacketTerminatedString();
  
    var lastChar = this.pluginData.length - 1;
    if (this.pluginData[lastChar] === '\0') {
      this.pluginData = this.pluginData.substr(0, lastChar);
    }
  }

  scrambleBuff() {
    var buffer = null;

    if (typeof this.scrambleBuff2 === 'undefined') {
      buffer = Buffer.from(this.scrambleBuff1);
    } else {
      buffer = Buffer.allocUnsafe(this.scrambleBuff1.length + this.scrambleBuff2.length);
      this.scrambleBuff1.copy(buffer, 0);
      this.scrambleBuff2.copy(buffer, this.scrambleBuff1.length);
    }

    return buffer;
  };

}

module.exports = ShakePacket;