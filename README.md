# winston-duplex

A simple [duplex stream](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) [transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md) for [winston](https://github.com/winstonjs/winston) to enable [streaming](https://github.com/winstonjs/winston#streaming-logs) usage.

## Why?

Winston's documentation makes it seems like [streaming](https://github.com/winstonjs/winston#streaming-logs) should work out of the box but in reality it requires at least one transport that implements the [stream](https://github.com/winstonjs/winston/blob/master/lib/winston/logger.js#L505) function. Additionally, out of the built-in transports only **file** and **http** implement this function while **console** and **stream** (shockingly) lack it. So the only transports that could use streaming also require either IO or an HTTP server at the other end which isn't super useful if you don't want or need those.

There are also no existing, simple, transports that implement it so, until now, you were stuck figuring out how to roll your own. `winston-duplex` solves this by providing the bare minimum required in a transport to get streaming functionality working as you'd expect.

## Installation

```
npm install winston-duplex --save
```

## Usage and Options

```js
import {DuplexTransport} from 'duplex-transport';

// no configuration necessary
const myNewTransport = new DuplexTransport();

// with configuration
const myConfiguredTransport = new DuplexTransport({
    stream: Duplex | TransformOptions,
    dump: boolean,
    name: 'myNamedTransport'
});

logger.add(myConfiguredTransport);

// prints log object to console
// IE logger.info('test');
logger.stream().on('data', (logObj) => console.log(logObj));
```

All options are optional:

* **stream**
  * `undefined` -- a new [`Transform`](https://nodejs.org/api/stream.html#stream_class_stream_transform) stream using `objectMode` is created that passes data straight to output
  * [`TransportStreamOptions`](https://nodes.duniter.io/typescript/duniter/typedoc/interfaces/_stream_.internal.transformoptions.html) -- an `object` of options used to instantiate a new [`Transform`](https://nodejs.org/api/stream.html#stream_class_stream_transform) stream
  * [`Duplex`](https://nodejs.org/api/stream.html#stream_class_stream_duplex) object -- The Duplex stream you want to use in the transport
* **dump** -- `boolean` (defaults to `false`)
  * When `true` the stream will be immediately consumed by an empty event listener. Useful to prevent [backpressure.](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)
  * Using `false` will cause the stream to buffer winston logs until it is consumed by invoking `logger.stream()`. Useful if you need to keep a history of logs between adding the transport and invoking the stream.
* **name** -- an identifier for this transport appended to the `transports` array in the object returned from the `log` event listener.

# License

MIT
