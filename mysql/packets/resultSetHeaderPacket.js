class ResultSetHeaderPacket {
  constructor(options) {
    options = options || {};
    this.fieldCount = options.fieldCount;
    this.extra = options.extra;
  }

  parse(parser) {
    this.fieldCount = parser.parseLengthCodedNumber();
  };

  write(writer) {
    writer.writeLengthCodedNumber(this.fieldCount);
  }
}

module.exports = ResultSetHeaderPacket;
