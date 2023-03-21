import {Duplex, Transform, TransformOptions} from "stream";
import Transport, {TransportStreamOptions} from "winston-transport";
import {MESSAGE} from 'triple-beam';
import os from 'os';

export interface DuplexTransportOptions extends TransportStreamOptions {
    stream?: Duplex | TransformOptions
    eol?: string,
    dump?: boolean,
    name?: string,
}

class DuplexTransport extends Transport {
    duplex: Duplex;
    name?: string;

    isObjectMode: boolean;
    eol: string;

    constructor(opts?: DuplexTransportOptions) {
        const {stream: optStream, dump = false, name} = opts || {};
        let stream: Transform;
        if (optStream instanceof Transform) {
            stream = optStream;
        } else if (optStream !== undefined) {
            stream = new Transform(optStream as TransformOptions);
        } else {
            stream = new Transform({
                transform(chunk, e, cb) {
                    cb(null, chunk)
                },
                objectMode: true,
            });
        }
        // @ts-ignore
        super({...opts, stream});
        this.duplex = stream;
        this.duplex.setMaxListeners(Infinity);
        this.name = name;
        this.isObjectMode = this.duplex.writableObjectMode;
        this.eol = opts.eol || os.EOL;

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

        this.duplex.write(`${info[MESSAGE]}${this.eol}`);
        if (callback) {
            callback(); // eslint-disable-line callback-return
        }
        return;
    }

    onStream(chunk: any) {
        try {
            if (this.duplex.writableObjectMode) {
                this.duplex.emit('log', {...chunk, name: this.name});
            } else {
                const msg = chunk.toString();
                this.duplex.emit('log', {
                    message: msg,
                    name: this.name,
                    [MESSAGE]: msg,
                });
            }
        } catch (e) {
            this.duplex.emit('error', e);
        }
    }

    stream(options: any = {}) {
        if(!this.duplex.listeners('data').some(x => this.onStream)) {
            this.duplex.on('data', this.onStream.bind(this));
        }
        return this.duplex;
    }
}

export default DuplexTransport;
