/// <reference types="node" />
import { Stream as StreamTransport } from "winston/lib/winston/transports";
import { Duplex, TransformOptions } from "stream";
import { TransportStreamOptions } from "winston-transport";
export interface DuplexTransportOptions extends TransportStreamOptions {
    stream?: Duplex | TransformOptions;
    eol?: string;
    dump?: boolean;
    name?: string;
}
declare class DuplexTransport extends StreamTransport {
    duplex: Duplex;
    name?: string;
    constructor(opts?: DuplexTransportOptions);
    onStream(chunk: any): void;
    stream(options?: any): Duplex;
}
export default DuplexTransport;
