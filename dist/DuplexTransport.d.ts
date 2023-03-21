/// <reference types="node" />
import { Duplex, TransformOptions } from "stream";
import Transport, { TransportStreamOptions } from "winston-transport";
export interface DuplexTransportOptions extends TransportStreamOptions {
    stream?: Duplex | TransformOptions;
    eol?: string;
    dump?: boolean;
    name?: string;
}
declare class DuplexTransport extends Transport {
    duplex: Duplex;
    name?: string;
    constructor(opts?: DuplexTransportOptions);
    onStream(chunk: any): void;
    stream(options?: any): Duplex;
}
export default DuplexTransport;
