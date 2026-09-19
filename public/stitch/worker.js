import './vendor/pdf-lib.min.js';
import { pageIndices, cleanPdf, readableError } from './core.js';
const { PDFDocument, degrees } = globalThis.PDFLib;
self.onmessage = async ({data}) => {
  try {
    if (data.type === 'inspect') {
      const doc = await PDFDocument.load(cleanPdf(await data.file.arrayBuffer()));
      self.postMessage({type: 'inspected', count: doc.getPageCount()});
      return;
    }
    const output = await PDFDocument.create();
    const skipped = [];
    let files = 0;
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      self.postMessage({type: 'progress', done: i, total: data.items.length, name: item.file.name});
      // Validate and copy the complete file before adding any pages: a failed
      // source must never leave a partially included document in the output.
      try {
        const source = await PDFDocument.load(cleanPdf(await item.file.arrayBuffer()));
        const pages = await output.copyPages(source, pageIndices(item.range, source.getPageCount()));
        for (const page of pages) page.setRotation(degrees((page.getRotation().angle + item.rotation) % 360));
        for (const page of pages) output.addPage(page);
        files++;
      } catch (error) {
        const reason = readableError(error);
        if (!data.skipErrors) throw new Error(`${item.file.name}: ${reason}`);
        skipped.push({name: item.file.name, reason});
      }
    }
    if (!output.getPageCount()) throw new Error('No pages could be merged. Check the file errors and page selections.');
    output.setTitle(data.title);
    output.setCreator('Stitch · Entertrainer');
    self.postMessage({type: 'progress', done: data.items.length, total: data.items.length, name: 'Preparing your download…'});
    const bytes = await output.save();
    self.postMessage({type: 'complete', bytes, files, pages: output.getPageCount(), skipped}, [bytes.buffer]);
  } catch (error) {
    self.postMessage({type: 'error', error: readableError(error)});
  }
};
