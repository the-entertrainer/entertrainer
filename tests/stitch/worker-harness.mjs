import { parentPort } from 'node:worker_threads';
globalThis.self = globalThis;
globalThis.postMessage = (data, transfer) => parentPort.postMessage(data, transfer);
await import('../../public/stitch/worker.js');
parentPort.on('message', data => globalThis.onmessage({data}));
