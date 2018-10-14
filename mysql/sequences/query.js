const Events = require('events');
const QueryPacket = require('../packets/queryPacket');
const OkPacket = require('../packets/okPacket');
const ResultSetHeaderPacket = require('../packets/resultSetHeaderPacket');
const ResultSet = require('../resultSet');
const FieldPacket = require('../packets/fieldPacket');
const EofPacket = require('../packets/eofPacket');
const RowDataPacket = require('../packets/rowDataPacket')
const ServerStatus = require('../constants/server_status');

class Query extends Events {
  constructor(sql, callback) {
    super();
    this.sql = sql;
    this.callback = callback;
    this._results = [];
    this._fields = [];
  }

  determinePacket(firstByte, parser) {
    const resultSet = this._resultSet;

    if (!resultSet) {
      switch (firstByte) {
        case 0x00: return OkPacket;
        case 0xff: {
          const err = new Error();
          err.message = 'query出错';
          throw err;
        };
        default: return ResultSetHeaderPacket;
      }
    }

    if (resultSet.eofPackets.length === 0) {
      return (resultSet.fieldPackets.length < resultSet.resultSetHeaderPacket.fieldCount)
        ? FieldPacket
        : EofPacket;
    }

    if (firstByte === 0xff) {
      const err = new Error();
      err.message = 'query失败！';
      throw err;
    }

    if (firstByte === 0xfe && parser.packetLength() < 9) {
      return EofPacket;
    }

    return RowDataPacket;
  }

  ResultSetHeaderPacket(packet) {
    this._resultSet = new ResultSet(packet);
  }

  RowDataPacket(packet, parser, connection) {
    packet.parse(parser, this._resultSet.fieldPackets, true, false, connection);

    if (this.callback) {
      this._resultSet.rows.push(packet);
    } else {
      this.emit('result', packet, this._index);
    }
  }

  _handleFinalResultPacket(packet) {
    if (packet.serverStatus & ServerStatus.SERVER_MORE_RESULTS_EXISTS) {
      return;
    }

    var results = (this._results.length > 1)
      ? this._results
      : this._results[0];

    var fields = (this._fields.length > 1)
      ? this._fields
      : this._fields[0];

    if (this.callback) {
      this.callback(results, fields);
    };
    this.emit('end');
  }

  EofPacket(packet) {
    this._resultSet.eofPackets.push(packet);

    if (this._resultSet.eofPackets.length === 1 && !this.callback) {
      this.emit('fields', this._resultSet.fieldPackets, this._index);
    }

    if (this._resultSet.eofPackets.length !== 2) {
      return;
    }

    if (this.callback) {
      this._results.push(this._resultSet.rows);
      this._fields.push(this._resultSet.fieldPackets);
    }

    this._resultSet = null;
    this._handleFinalResultPacket(packet);
  };

  start() {
    this.emit('packet', new QueryPacket(this.sql));
  }

  FieldPacket(packet) {
    this._resultSet.fieldPackets.push(packet);
  }

  OkPacket() {
    if (this.callback) {
      this.callback([], []);
    };
    this.emit('end');
  }
}

module.exports = Query;
