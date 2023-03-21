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
    isObjectMode: boolean;
    eol: string;
    constructor(opts?: DuplexTransportOptions);
    /**
     * Core logging method exposed to Winston.
     * @param {Object} info - TODO: add param description.
     * @param {Function} callback - TODO: add param description.
     * @returns {undefined}
     */
    log(info: any, callback: any): void;
    onStream(chunk: any): void;
    stream(options?: any): Duplex;
}
export default DuplexTransport;
