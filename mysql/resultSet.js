class ResultSet {
  constructor(resultSetHeaderPacket) {
    this.resultSetHeaderPacket = resultSetHeaderPacket;
    this.fieldPackets          = [];
    this.eofPackets            = [];
    this.rows                  = [];
  }
}

module.exports = ResultSet;
