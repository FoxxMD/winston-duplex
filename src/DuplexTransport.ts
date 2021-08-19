import {Stream as StreamTransport} from "winston/lib/winston/transports";
import {Duplex, Transform, TransformOptions} from "stream";
import {TransportStreamOptions} from "winston-transport";

export interface DuplexTransportOptions extends TransportStreamOptions {
    stream?: Duplex | TransformOptions
    eol?: string,
    dump?: boolean,
    name?: string,
}

class DuplexTransport extends StreamTransport {
    duplex: Duplex;
    name?: string;

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
        super({...opts, stream});
        this.duplex = stream;
        this.name = name;

        if (dump) {
            // immediately dump data
            this.duplex.on('data', (_) => {
            });
        }
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
                    [Symbol.for('message')]: msg,
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
