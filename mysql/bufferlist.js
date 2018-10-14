class BufferList {
  constructor() {
    this._bufs = [];
    this._size = 0;
  }

  get size() {
    return this._size;
  }

  shift() {
    const buf = this._bufs.shift();
    if (buf) {
      this._size -= buf.length;
    }
    return buf;
  }

  push(buf) {
    this._bufs.push(buf);
    this._size += buf.length;
  }
}

module.exports = BufferList;
