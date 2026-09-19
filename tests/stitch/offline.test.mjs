import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const publicRoot = path.resolve('public');
test('offline install caches all local assets and serves shell and engine with network unavailable', async () => {
  const handlers = {}, cached = new Map(), deleted = [];
  const origin = 'https://www.entertrainer.in';
  const resolve = value => new URL(typeof value === 'string' ? value : value.url, `${origin}/stitch/sw.js`).href;
  const cache = {
    async addAll(assets) {
      for (const asset of assets) {
        const url = new URL(resolve(asset));
        let file = path.join(publicRoot,url.pathname);
        if ((await stat(file)).isDirectory()) file += '/index.html';
        const bytes = await readFile(file);
        assert.ok(bytes.length > 0, `${asset} must exist and be nonempty`);
        cached.set(url.href,bytes);
      }
    },
    async match(request) { return cached.get(resolve(request)); }
  };
  const context = {
    URL, self:{location:{origin},addEventListener:(name,fn) => handlers[name] = fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},
    caches:{open:async()=>cache,keys:async()=>['stitch-v0','stitch-v1','other-app-cache'],delete:async key=>deleted.push(key)},
    fetch:()=>{throw new Error('Network unavailable');}
  };
  vm.runInNewContext(await readFile('public/stitch/sw.js','utf8'),context);
  let pending;
  handlers.install({waitUntil:p=>pending=p}); await pending;
  handlers.activate({waitUntil:p=>pending=p}); await pending;
  assert.deepEqual(deleted,['stitch-v0']);
  for (const [url,mode] of [['/stitch/','navigate'],['/stitch/worker.js','cors'],['/stitch/vendor/pdf-lib.min.js','cors'],['/fonts/webfonts/archivo-var-latin.woff2','cors']]) {
    let result;
    handlers.fetch({request:{url:origin+url,method:'GET',mode},respondWith:p=>result=p});
    assert.ok((await result).length > 0,`${url} works without network`);
  }
  let intercepted = false;
  handlers.fetch({request:{url:origin+'/empower',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});
  assert.equal(intercepted,false,'other site navigation is not intercepted');
  assert.ok(!Array.from(cached.keys()).some(key=>key.endsWith('.pdf')),'no user PDFs cached');
});
