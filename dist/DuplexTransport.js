"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const winston_transport_1 = __importDefault(require("winston-transport"));
const triple_beam_1 = require("triple-beam");
const os_1 = __importDefault(require("os"));
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
        this.duplex.setMaxListeners(Infinity);
        this.name = name;
        this.isObjectMode = this.duplex.writableObjectMode;
        this.eol = opts.eol || os_1.default.EOL;
        if (dump) {
            // immediately dump data
            this.duplex.on('data', (_) => {
            });
        }
    }
    /**
     * Core logging method exposed to Winston.
     * @param {Object} info - TODO: add param description.
     * @param {Function} callback - TODO: add param description.
     * @returns {undefined}
     */
    log(info, callback) {
        setImmediate(() => this.emit('logged', info));
        if (this.isObjectMode) {
            this.duplex.write(info);
            if (callback) {
                callback(); // eslint-disable-line callback-return
            }
            return;
        }
        this.duplex.write(`${info[triple_beam_1.MESSAGE]}${this.eol}`);
        if (callback) {
            callback(); // eslint-disable-line callback-return
        }
        return;
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
