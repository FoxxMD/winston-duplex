"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const winston_transport_1 = __importDefault(require("winston-transport"));
const triple_beam_1 = require("triple-beam");
class DuplexTransport extends winston_transport_1.default {
    constructor(opts) {
        const { stream: optStream, dump = false, name } = opts || {};
        let stream;
        if (optStream instanceof stream_1.Transform) {
            stream = optStream;
        }
        else if (optStream !== undefined) {
            stream = new stream_1.Transform(optStream);
        }
        else {
            stream = new stream_1.Transform({
                transform(chunk, e, cb) {
                    cb(null, chunk);
                },
                objectMode: true,
            });
        }
        // @ts-ignore
        super(Object.assign(Object.assign({}, opts), { stream }));
        this.duplex = stream;
        this.name = name;
        if (dump) {
            // immediately dump data
            this.duplex.on('data', (_) => {
            });
        }
    }
    onStream(chunk) {
        try {
            if (this.duplex.writableObjectMode) {
                this.duplex.emit('log', Object.assign(Object.assign({}, chunk), { name: this.name }));
            }
            else {
                const msg = chunk.toString();
                this.duplex.emit('log', {
                    message: msg,
                    name: this.name,
                    [triple_beam_1.MESSAGE]: msg,
                });
            }
        }
        catch (e) {
            this.duplex.emit('error', e);
        }
    }
    stream(options = {}) {
        if (!this.duplex.listeners('data').some(x => this.onStream)) {
            this.duplex.on('data', this.onStream.bind(this));
        }
        return this.duplex;
    }
}
exports.default = DuplexTransport;
