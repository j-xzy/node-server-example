class QueryPacket {
  constructor(sql) {
    this.command = 0x03;
    this.sql = sql;
  }

  parse(parser) {
    this.command = parser.parseUnsignedNumber(1);
    this.sql = parser.parsePacketTerminatedString();
  };

  write(writer) {
    writer.writeUnsignedNumber(1, this.command);
    writer.writeString(this.sql);
  };
}

module.exports = QueryPacket;
