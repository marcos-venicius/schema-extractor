import { open } from 'node:fs/promises'

const BRACKET_OPEN_CHAR = '{'.charCodeAt(0)
const BRACKET_CLOSE_CHAR = '}'.charCodeAt(0)

export class JsonArrayReader {
  constructor(filename, chunkBufferSize = 1024, maxObjectBufferSize = 1024 * 256) {
    this.chunkBufferSize = chunkBufferSize
    this.maxObjectBufferSize = maxObjectBufferSize
    this.file = null
    this.filename = filename
    this.stack = []
    this.collectingObject = false;
    this.currentObjectBufferSize = 0;
    this.objectsCount = 0;
  }

  async read(callback) {
    const file = await open(this.filename)

    const buffer = Buffer.alloc(this.chunkBufferSize)
    const objectBuffer = Buffer.alloc(this.maxObjectBufferSize)

    try {
      while (true) {
        const data = await file.read(buffer, 0, buffer.length)

        if (data.bytesRead === 0) break;

        for (let i = 0; i < data.bytesRead; ++i) {
          const chr = buffer[i]

          switch (chr) {
            case BRACKET_OPEN_CHAR: {
              this.collectingObject = true;
              this.stack.push(BRACKET_OPEN_CHAR)
            } break;
            case BRACKET_CLOSE_CHAR: {
              const bracket = this.stack.pop()

              if (bracket != BRACKET_OPEN_CHAR) throw new Error('invalid json')
            } break;
            default: break;
          }

          if (this.collectingObject) {
            if (this.currentObjectBufferSize >= this.maxObjectBufferSize) {
              throw new Error('insuficient object buffer size')
            }

            objectBuffer[this.currentObjectBufferSize++] = chr

            if (this.stack.length === 0) {
              this.objectsCount++;

              const json = JSON.parse(objectBuffer.slice(0, this.currentObjectBufferSize).toString('utf-8', 0, this.currentObjectBufferSize));

              await callback(json);

              this.collectingObject = false
              this.currentObjectBufferSize = 0
            }
          }
        }
      }
    } finally {
      await file.close();
    }

    return this.objectsCount;
  }
}
