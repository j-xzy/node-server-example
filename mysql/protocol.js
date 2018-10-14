const Parser = require('./parser');
const HandShake = require('./sequences/handshake');
const Query = require('./sequences/query');
const PacketWriter = require('./packetWriter');
const OkPacket = require('./packets/okPacket');
const RowDataPacket = require('./packets/rowDataPacket');
const Events = require('events');

class Protocol extends Events {
  constructor(_connection) {
    super();
    this._connection = _connection;
    this._parser = new Parser(this._parsePacket.bind(this));
    this._queue = [];
  }

  write(chunk) {
    this._parser.write(chunk);
  }

  handshake(config) {
    this._enqueue(new HandShake(config));
  }

  query(sql, callback) {
    this._enqueue(new Query(sql, callback));
  }

  _parsePacket() {
    const sequence = this._queue[0];
    const Packet = this._determinePacket(sequence);
    const packet = new Packet({ protocol41: true });

    if (Packet === RowDataPacket) {
      sequence.RowDataPacket(packet, this._parser, this._connection);
      return;
    }

    packet.parse(this._parser);
    sequence[Packet.name](packet);
  }

  _determinePacket(sequence) {
    const firstByte = this._parser.peak();
    let Packet = sequence.determinePacket(firstByte, this._parser);
    if (Packet) {
      return Packet;
    }

    switch (firstByte) {
      case 0x00:
        return OkPacket;
      case 0xfe:
      case 0xff: {
        const err = new Error();
        err.message = '连接失败！';
        throw (err);
      }
    }
  }

  _enqueue(sequence) {
    this._queue.push(sequence);
    sequence
      .on('packet', (packet) => {
        var packetWriter = new PacketWriter();
        packet.write(packetWriter);
        this.emit('data', packetWriter.toBuffer(this._parser));
      })
      .on('end', () => {
        this._dequeue(sequence);
      });
    if(this._queue.length === 1) {
      this._queue[0].start();
    }
  }

  _dequeue() {
    this._queue.shift();
    const sequence = this._queue[0];
    this._parser.resetPacketNumber();
    if (sequence) {
      sequence.start();
    }
  }

}

module.exports = Protocol;
