const BufferList = require('./bufferlist');

class Parser {
  constructor(onPacket) {
    this._onPacket = onPacket;
    this._buffer = Buffer.alloc(0);
    this._nextBuffers = new BufferList();
    this._offset = 0;
    this._packetOffset = null;
    this._packetEnd = null;
    this._packetHeader = null;
    this._nextPacketNumber = 0;
  }

  /**
   * 写入chunk
   * @param {*} chunk 
   */
  write(chunk) {
    this._nextBuffers.push(chunk);

    while (true) {
      // 头
      if (!this._packetHeader) {
        if (!this._combineNextBuffers(4)) {
          break;
        }

        this._packetHeader = {
          length: this.parseUnsignedNumber(3),
          id: this.parseUnsignedNumber(1)
        };

        this.incrementPacketNumber();
      }

      if (!this._combineNextBuffers(this._packetHeader.length)) {
        break;
      }

      this._packetEnd = this._offset + this._packetHeader.length;
      this._packetOffset = this._offset;

      this._onPacket(this._packetHeader);
      this._advanceToNextPacket();
    }
  }

  packetLength() {
    if (!this._packetHeader) {
      return null;
    }
  
    return this._packetHeader.length;
  }

  parseUnsignedNumber(bytes) {
    if (bytes === 1) {
      return this._buffer[this._offset++];
    }

    let value = 0;
    let offset = this._offset + bytes - 1;

    while (offset >= this._offset) {
      value = (value << 8) | this._buffer[offset];
      offset--;
    }

    this._offset += bytes;

    return value;
  }

  parseNullTerminatedString() {
    var end = this._nullByteOffset();
    var value = this._buffer.toString('utf-8', this._offset, end);
    this._offset = end + 1;

    return value;
  }

  reachedPacketEnd() {
    return this._offset === this._packetEnd;
  };

  parseLengthCodedString() {
    var length = this.parseLengthCodedNumber();

    if (length === null) {
      return null;
    }

    return this.parseString(length);
  };

  parseString(length) {
    var offset = this._offset;
    var end = offset + length;
    var value = this._buffer.toString(this._encoding, offset, end);

    this._offset = end;
    return value;
  };

  parseLengthCodedNumber() {
    return this._buffer[this._offset++];
  };

  _nullByteOffset() {
    var offset = this._offset;

    while (this._buffer[offset] !== 0x00) {
      offset++;

      if (offset >= this._buffer.length) {
        var err = new Error('超出');
        throw err;
      }
    }

    return offset;
  }

  parseBuffer(length) {
    var response = Buffer.alloc(length);
    this._buffer.copy(response, 0, this._offset, this._offset + length);

    this._offset += length;
    return response;
  }

  peak(offset) {
    return this._buffer[this._offset];
  }

  parsePacketTerminatedString() {
    var length = this._packetEnd - this._offset;
    return this.parseString(length);
  }

  /**
   * 合并buffer
   * @param {number} bytes 
   */
  _combineNextBuffers(bytes) {
    const length = this._buffer.length - this._offset;

    if (length >= bytes) {
      return true;
    }

    if ((length + this._nextBuffers._size) < bytes) {
      return false;
    }

    const buffers = [];
    let bytesNeeded = bytes - length;

    while (bytesNeeded > 0) {
      const buffer = this._nextBuffers.shift();
      buffers.push(buffer);
      bytesNeeded -= buffer.length;
    }

    this.append(buffers);

    return true;
  }

  append(chunk) {
    if (!chunk || chunk.length === 0) {
      return;
    }

    // Calculate slice ranges
    var sliceEnd = this._buffer.length;
    var sliceStart = this._packetOffset === null
      ? this._offset
      : this._packetOffset;
    var sliceLength = sliceEnd - sliceStart;

    // Get chunk data
    var buffer = null;
    var chunks = !(chunk instanceof Array || Array.isArray(chunk)) ? [chunk] : chunk;
    var length = 0;
    var offset = 0;

    for (var i = 0; i < chunks.length; i++) {
      length += chunks[i].length;
    }

    if (sliceLength !== 0) {
      // Create a new Buffer
      buffer = Buffer.allocUnsafe(sliceLength + length);
      offset = 0;

      // Copy data slice
      offset += this._buffer.copy(buffer, 0, sliceStart, sliceEnd);

      // Copy chunks
      for (var i = 0; i < chunks.length; i++) {
        offset += chunks[i].copy(buffer, offset);
      }
    } else if (chunks.length > 1) {
      // Create a new Buffer
      buffer = Buffer.allocUnsafe(length);
      offset = 0;

      // Copy chunks
      for (var i = 0; i < chunks.length; i++) {
        offset += chunks[i].copy(buffer, offset);
      }
    } else {
      // Buffer is the only chunk
      buffer = chunks[0];
    }

    // Adjust data-tracking pointers
    this._buffer = buffer;
    this._offset = this._offset - sliceStart;
    this._packetEnd = this._packetEnd !== null
      ? this._packetEnd - sliceStart
      : null;
    this._packetOffset = this._packetOffset !== null
      ? this._packetOffset - sliceStart
      : null;
  };

  incrementPacketNumber() {
    var currentPacketNumber = this._nextPacketNumber;
    this._nextPacketNumber = (this._nextPacketNumber + 1) % 256;

    return currentPacketNumber;
  }

  resetPacketNumber() {
    this._nextPacketNumber = 0;
  }

  _advanceToNextPacket() {
    this._offset = this._packetEnd;
    this._packetHeader = null;
    this._packetEnd = null;
    this._packetHeader = null;
  };


}

module.exports = Parser;
