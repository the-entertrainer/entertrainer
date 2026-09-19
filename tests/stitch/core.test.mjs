import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { PDFDocument, PDFName, degrees } from 'pdf-lib';
import { pageIndices, cleanPdf, outputName } from '../../public/stitch/core.js';
async function pdf(widths) {
  const doc = await PDFDocument.create();
  for (const width of widths) { const p = doc.addPage([width, 400]); p.setRotation(degrees(90)); }
  return new File([await doc.save()], 'test.pdf', {type:'application/pdf'});
}
function run(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker-harness.mjs', import.meta.url));
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('Worker timeout')); }, 10000);
    worker.on('error', error => { clearTimeout(timer); worker.terminate(); reject(error); });
    worker.on('message', result => { if (result.type !== 'progress') { clearTimeout(timer); worker.terminate(); resolve(result); } });
    worker.postMessage(data);
  });
}
test('page selections preserve order, reverse ranges and deliberate duplicates', () => {
  assert.deepEqual(pageIndices('3-1,2', 4), [2,1,0,1]);
  assert.deepEqual(pageIndices('all', 3), [0,1,2]);
  for (const value of ['0','4','1,','-1','1.5','abc','1--2']) assert.throws(() => pageIndices(value,3));
});
test('header repair returns the actual sliced bytes', () => {
  const data = new TextEncoder().encode('\ufeffgarbage%PDF-1.7');
  assert.equal(new TextDecoder().decode(cleanPdf(data.buffer)), '%PDF-1.7');
  assert.throws(() => cleanPdf(new TextEncoder().encode('no PDF').buffer));
});
test('output filename is safe and always has a PDF extension', () => {
  assert.equal(outputName(' ../output:final '), '..-output-final.pdf');
  assert.equal(outputName(''), 'stitched-document.pdf');
  assert.equal(outputName('FILE.PDF'), 'FILE.PDF');
});
test('real worker merges selected pages in exact order with additive rotation', async () => {
  const a = await pdf([200,210,220]), b = await pdf([300]);
  const result = await run({type:'merge', items:[{file:a,range:'3-1,2',rotation:90},{file:b,range:'',rotation:0}],skipErrors:false,title:'test.pdf'});
  assert.equal(result.type,'complete'); assert.equal(result.files,2); assert.equal(result.pages,5);
  const output = await PDFDocument.load(result.bytes);
  assert.deepEqual(output.getPages().map(p => p.getWidth()),[220,210,200,210,300]);
  assert.deepEqual(output.getPages().map(p => p.getRotation().angle),[180,180,180,180,90]);
});
test('unreadable sources stop strict merges and are fully reported in skip mode', async () => {
  const bad = new File(['not pdf'],'broken.pdf'), good = await pdf([200]);
  const data = {type:'merge',items:[{file:bad,range:'',rotation:0},{file:good,range:'',rotation:0}],title:'test'};
  assert.equal((await run({...data,skipErrors:false})).type,'error');
  const result = await run({...data,skipErrors:true});
  assert.equal(result.type,'complete'); assert.equal(result.pages,1); assert.equal(result.skipped[0].name,'broken.pdf');
});
test('all-bad sources never create an empty download', async () => {
  const result = await run({type:'merge',items:[{file:new File(['bad'],'bad.pdf'),range:'',rotation:0}],skipErrors:true});
  assert.equal(result.type,'error');
});
test('encrypted sources are explicitly rejected, not silently copied', async () => {
  const doc = await PDFDocument.create(); doc.addPage();
  doc.context.trailerInfo.Encrypt = doc.context.register(doc.context.obj({Filter:PDFName.of('Standard'),V:1,R:2}));
  const result = await run({type:'inspect',file:new File([await doc.save()],'locked.pdf')});
  assert.equal(result.type,'error'); assert.match(result.error,/Password-protected/);
});
test('inspection accepts PDFs with a prefixed header', async () => {
  const original = await pdf([200,300]);
  const result = await run({type:'inspect',file:new File(['\ufeff',await original.arrayBuffer()],'prefixed.pdf')});
  assert.equal(result.count,2);
});
test('terminating a worker interrupts a merge without producing a partial result', async () => {
  const file = await pdf([200]);
  const worker = new Worker(new URL('./worker-harness.mjs', import.meta.url));
  let completed = false;
  await new Promise((resolve, reject) => {
    worker.on('error',reject);
    worker.on('message', async result => { if (result.type === 'complete') completed = true; if (result.type === 'progress') { await worker.terminate(); resolve(); } });
    worker.postMessage({type:'merge',items:Array.from({length:1000},() => ({file,range:'',rotation:0})),skipErrors:false,title:'cancel'});
  });
  assert.equal(completed,false);
});
