import {pageIndices, outputName} from './core.js';
const $ = id => document.getElementById(id);
let items = [], busy = false, importing = false, currentPage = 0, mergeWorker = null, resultUrl = null, dragId = null, installEvent = null;
const perPage = 30;
const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
const formatSize = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
function notice(text, error = false) { $('notice').textContent = text; $('notice').classList.toggle('error', error); }
function invalidate() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null; $('download').removeAttribute('href'); $('result').hidden = true; $('report').hidden = true;
}
function validation(item) {
  if (item.error) return item.error;
  if (item.count == null) return '';
  try { pageIndices(item.range, item.count); return ''; } catch (error) { return error.message; }
}
function refreshSummary() {
  let pages = 0, hasInvalidRange = false;
  for (const item of items) {
    if (item.count) {
      try { pages += pageIndices(item.range, item.count).length; } catch { hasInvalidRange = true; }
    }
  }
  $('file-count').textContent = items.length;
  $('total-files').textContent = items.length;
  $('total-pages').textContent = importing ? 'Checking…' : String(pages);
  $('total-size').textContent = formatSize(items.reduce((n, item) => n + item.file.size, 0));
  $('merge').disabled = busy || importing || !pages || hasInvalidRange || (!$('skip-errors').checked && items.some(item => item.error));
  for (const id of ['add', 'folder', 'samples', 'sort', 'reverse', 'filename', 'skip-errors']) $(id).disabled = busy || importing;
  $('clear').disabled = busy || importing || !items.length;
  $('toolbar').hidden = !items.length;
  $('empty').hidden = !!items.length;
  $('queue').setAttribute('aria-busy', String(busy || importing));
}
function button(text, label, onClick) {
  const el = document.createElement('button'); el.textContent = text; el.setAttribute('aria-label', label); el.title = label; el.disabled = busy || importing; el.addEventListener('click', onClick); return el;
}
function move(id, position) {
  if (busy || importing) return;
  const index = items.findIndex(item => item.id === id);
  const target = Math.min(items.length - 1, Math.max(0, position));
  if (index < 0 || index === target) return;
  const [item] = items.splice(index, 1); items.splice(target, 0, item);
  invalidate(); render(); notice(`${item.file.name} moved to position ${target + 1}.`);
  const row = $('queue').querySelector(`[data-id="${id}"] .position`); row?.focus();
}
function render() {
  refreshSummary();
  const term = $('search').value.trim().toLowerCase();
  const visible = items.filter(item => item.file.name.toLowerCase().includes(term));
  currentPage = Math.min(currentPage, Math.max(0, Math.ceil(visible.length / perPage) - 1));
  $('filter-note').hidden = !term || !items.length;
  $('no-results').hidden = !items.length || !!visible.length;
  $('pagination').hidden = visible.length <= perPage;
  $('previous').disabled = currentPage === 0;
  $('next').disabled = (currentPage + 1) * perPage >= visible.length;
  $('page-label').textContent = `Page ${currentPage + 1} of ${Math.max(1, Math.ceil(visible.length / perPage))}`;
  const fragment = document.createDocumentFragment();
  for (const item of visible.slice(currentPage * perPage, (currentPage + 1) * perPage)) {
    const index = items.indexOf(item);
    const row = document.createElement('li'); row.className = 'file-row'; row.dataset.id = item.id;
    const grip = button(String(index + 1).padStart(2, '0'), `${item.file.name}, position ${index + 1}. Drag to reorder or use the move controls.`, () => {});
    grip.className = 'position'; grip.draggable = !busy && !importing;
    grip.addEventListener('dragstart', event => { dragId = item.id; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id); });
    grip.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.drag-target').forEach(el => el.classList.remove('drag-target')); });
    row.addEventListener('dragover', event => { if (dragId && !busy && !importing) { event.preventDefault(); row.classList.add('drag-target'); } });
    row.addEventListener('dragleave', () => row.classList.remove('drag-target'));
    row.addEventListener('drop', event => { if (dragId) { event.preventDefault(); event.stopPropagation(); move(dragId, index); dragId = null; } });
    const body = document.createElement('div');
    const head = document.createElement('div'); head.className = 'file-head';
    const name = document.createElement('span'); name.className = 'file-name'; name.textContent = item.file.name;
    const remove = button('×', `Remove ${item.file.name}`, () => { items = items.filter(x => x.id !== item.id); invalidate(); render(); notice(`${item.file.name} removed.`); }); remove.className = 'remove';
    head.append(name, remove);
    const meta = document.createElement('p'); meta.className = 'file-meta'; meta.textContent = `${formatSize(item.file.size)} · ${item.count == null ? item.error ? 'Unreadable PDF' : 'Checking pages…' : `${item.count} ${item.count === 1 ? 'page' : 'pages'}`}${item.file.webkitRelativePath ? ` · ${item.file.webkitRelativePath}` : ''}`;
    const controls = document.createElement('div'); controls.className = 'row-controls';
    const rangeLabel = document.createElement('label'); rangeLabel.className = 'range-control'; rangeLabel.textContent = 'Pages';
    const range = document.createElement('input'); range.placeholder = 'All pages'; range.value = item.range; range.disabled = busy || importing || !!item.error; range.setAttribute('aria-label', `Pages in ${item.file.name}`);
    const error = document.createElement('p'); error.className = 'row-error'; error.id = `error-${item.id}`; error.textContent = validation(item); error.hidden = !error.textContent;
    range.setAttribute('aria-describedby', error.id); range.setAttribute('aria-invalid', String(!!validation(item)));
    range.addEventListener('input', () => { item.range = range.value; invalidate(); error.textContent = validation(item); error.hidden = !error.textContent; range.setAttribute('aria-invalid', String(!!error.textContent)); refreshSummary(); });
    rangeLabel.append(range);
    const rotateLabel = document.createElement('label'); rotateLabel.textContent = 'Rotate';
    const rotation = document.createElement('select'); rotation.setAttribute('aria-label', `Rotate ${item.file.name}`); rotation.disabled = busy || importing || !!item.error;
    for (const angle of [0, 90, 180, 270]) { const option = new Option(`${angle}°`, String(angle)); option.selected = angle === item.rotation; rotation.add(option); }
    rotation.addEventListener('change', () => { item.rotation = Number(rotation.value); invalidate(); }); rotateLabel.append(rotation);
    const positionLabel = document.createElement('label'); positionLabel.textContent = 'Position';
    const position = document.createElement('input'); position.className = 'move-input'; position.type = 'number'; position.min = '1'; position.max = String(items.length); position.value = String(index + 1); position.disabled = busy || importing; position.setAttribute('aria-label', `Move ${item.file.name} to position`);
    position.addEventListener('change', () => { if (Number.isInteger(Number(position.value)) && Number(position.value) >= 1 && Number(position.value) <= items.length) move(item.id, Number(position.value) - 1); else position.value = String(index + 1); }); positionLabel.append(position);
    const moves = document.createElement('div'); moves.className = 'move-buttons';
    const up = button('↑', `Move ${item.file.name} up`, () => move(item.id, index - 1)); up.disabled ||= index === 0;
    const down = button('↓', `Move ${item.file.name} down`, () => move(item.id, index + 1)); down.disabled ||= index === items.length - 1;
    moves.append(up, down); controls.append(rangeLabel, rotateLabel, positionLabel, moves); body.append(head, meta, controls, error); row.append(grip, body); fragment.append(row);
  }
  $('queue').replaceChildren(fragment);
}
function inspect(file) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {type: 'module'});
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('Reading timed out. Try a smaller or repaired PDF.')); }, 45000);
    const stop = () => { clearTimeout(timer); worker.terminate(); };
    worker.onmessage = ({data}) => { stop(); if (data.type === 'error') reject(new Error(data.error)); else resolve(data.count); };
    worker.onerror = () => { stop(); reject(new Error('The PDF engine could not start. Reload while online and try again.')); };
    worker.postMessage({type:'inspect', file});
  });
}
async function addFiles(files) {
  if (busy || importing) return;
  const list = Array.from(files), accepted = [], excluded = [];
  let total = items.reduce((n, item) => n + item.file.size, 0);
  for (const file of list) {
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { excluded.push(`${file.name}: not a PDF`); continue; }
    if (!file.size) { excluded.push(`${file.name}: empty file`); continue; }
    if (total + file.size > 512 * 1024 * 1024) { excluded.push(`${file.name}: the stack exceeds the 512 MB source-size limit`); continue; }
    if (items.length + accepted.length >= 2000) { excluded.push(`${file.name}: the stack exceeds 2,000 files`); continue; }
    total += file.size;
    accepted.push({id:crypto.randomUUID(), file, range:'', rotation:0, count:null, error:''});
  }
  if (!accepted.length) { notice(excluded.join('; ') || 'No PDF files found.', true); return; }
  importing = true; invalidate(); items.push(...accepted); render(); notice(`Checking ${accepted.length} PDFs…`);
  for (const item of accepted) {
    try { item.count = await inspect(item.file); if (!item.count) item.error = 'This PDF has no pages.'; }
    catch (error) { item.error = error.message; }
    refreshSummary();
  }
  importing = false; render();
  const failed = accepted.filter(item => item.error).length;
  notice(`Added ${accepted.length} ${accepted.length === 1 ? 'file' : 'files'}.${failed ? ` ${failed} unreadable; review the errors below each file.` : ''}${excluded.length ? ` Not added: ${excluded.join('; ')}.` : ''}`, !!failed || !!excluded.length);
}
$('add').onclick = () => $('files').click(); $('folder').onclick = () => $('folders').click();
for (const id of ['files', 'folders']) $(id).onchange = event => { const files = Array.from(event.target.files); event.target.value = ''; addFiles(files); };
// Prevent the browser navigating away when a file misses the drop zone.
window.addEventListener('dragover', event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); });
window.addEventListener('drop', event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); });
$('dropzone').addEventListener('dragover', event => { if (!dragId && !busy && !importing) { event.preventDefault(); $('dropzone').classList.add('drag-over'); } });
$('dropzone').addEventListener('dragleave', () => $('dropzone').classList.remove('drag-over'));
async function walk(entry) {
  if (entry.isFile) return [await new Promise((resolve, reject) => entry.file(resolve, reject))];
  if (!entry.isDirectory) return [];
  const reader = entry.createReader(), files = [];
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) break;
    for (const child of batch) files.push(...await walk(child));
  }
  return files;
}
$('dropzone').addEventListener('drop', async event => {
  event.preventDefault(); $('dropzone').classList.remove('drag-over');
  if (busy || importing || dragId) return;
  const fallback = Array.from(event.dataTransfer.files);
  const entries = Array.from(event.dataTransfer.items || []).map(item => item.webkitGetAsEntry?.()).filter(Boolean);
  try {
    const files = [];
    for (const entry of entries) files.push(...await walk(entry));
    await addFiles(entries.length ? files : fallback);
  } catch { notice('This folder could not be read. Use Choose a folder or add its PDFs directly.', true); }
});
$('search').oninput = () => { currentPage = 0; render(); };
$('sort').onchange = event => {
  if (busy || importing || !event.target.value) return;
  const order = event.target.value;
  items.sort((a,b) => order === 'az' ? collator.compare(a.file.name,b.file.name) : order === 'za' ? collator.compare(b.file.name,a.file.name) : order === 'small' ? a.file.size-b.file.size : b.file.size-a.file.size);
  event.target.value = ''; invalidate(); render(); notice('Stack reordered.');
};
$('reverse').onclick = () => { if (!busy && !importing) { items.reverse(); invalidate(); render(); } };
$('previous').onclick = () => { currentPage--; render(); }; $('next').onclick = () => { currentPage++; render(); };
$('clear').onclick = () => $('clear-dialog').showModal();
$('clear-dialog').addEventListener('close', () => { if ($('clear-dialog').returnValue === 'clear' && !busy && !importing) { items = []; $('search').value = ''; invalidate(); render(); notice('Stack cleared.'); } });
$('skip-errors').onchange = () => { invalidate(); refreshSummary(); };
$('filename').oninput = () => { if (resultUrl) $('download').download = outputName($('filename').value); };
function finishWorker() { mergeWorker?.terminate(); mergeWorker = null; busy = false; $('progress-section').hidden = true; render(); }
$('merge').onclick = () => {
  if ($('merge').disabled || busy) return;
  busy = true; invalidate(); render(); notice(''); $('progress-section').hidden = false; $('progress').value = 0; $('progress-title').textContent = 'Stitching…';
  try {
    mergeWorker = new Worker('./worker.js', {type:'module'});
    mergeWorker.onmessage = ({data}) => {
      if (data.type === 'progress') { $('progress').value = Math.round(data.done / data.total * 100); $('progress-file').textContent = data.name; }
      if (data.type === 'error') { finishWorker(); notice(data.error, true); }
      if (data.type === 'complete') {
        resultUrl = URL.createObjectURL(new Blob([data.bytes], {type:'application/pdf'}));
        $('download').href = resultUrl; $('download').download = outputName($('filename').value);
        $('result-title').textContent = data.skipped.length ? 'Ready, with files omitted.' : 'Your PDF is ready.';
        $('result-description').textContent = `${data.pages} ${data.pages === 1 ? 'page' : 'pages'} from ${data.files} ${data.files === 1 ? 'file' : 'files'}. ${formatSize(data.bytes.length)}.${data.skipped.length ? ` ${data.skipped.length} files left out; review the report below.` : ''}`;
        $('result').hidden = false;
        $('report-list').replaceChildren();
        for (const item of data.skipped) { const li = document.createElement('li'); li.textContent = `${item.name}: ${item.reason}`; $('report-list').append(li); }
        $('report').hidden = !data.skipped.length;
        finishWorker(); notice(data.skipped.length ? 'Merge finished with omissions. Review Files left out before downloading.' : 'Merge complete. Your PDF is ready to download.'); $('download').focus();
      }
    };
    mergeWorker.onerror = () => { finishWorker(); notice('The PDF worker stopped. Try fewer or smaller files, or reload the app.', true); };
    mergeWorker.postMessage({type:'merge', items: items.map(({file,range,rotation}) => ({file,range,rotation})), skipErrors:$('skip-errors').checked, title:outputName($('filename').value)});
  } catch (error) { finishWorker(); notice(`Could not start: ${error.message}`, true); }
};
$('cancel').onclick = () => { finishWorker(); notice('Stitching cancelled. No partial PDF was saved. Your stack is unchanged.'); };
$('samples').onclick = async () => {
  $('samples').disabled = true;
  try {
    await import('./vendor/pdf-lib.min.js');
    const files = [];
    for (const [name, title, count] of [['01-cover.pdf','A small collection.',1],['02-notes.pdf','The useful bits.',3],['03-appendix.pdf','One last thing.',2]]) {
      const doc = await globalThis.PDFLib.PDFDocument.create();
      for (let i = 0; i < count; i++) {
        const page = doc.addPage([595,842]);
        page.drawRectangle({x:40,y:720,width:515,height:70,color:globalThis.PDFLib.rgb(1,.83,.23)});
        page.drawText('STITCH / ENTERTRAINER',{x:55,y:748,size:16});
        page.drawText(title,{x:55,y:665,size:28});
        page.drawText(`${name} - page ${i+1} of ${count}`,{x:55,y:620,size:13});
      }
      files.push(new File([await doc.save()],name,{type:'application/pdf'}));
    }
    await addFiles(files);
  } catch (error) { notice(`Sample files could not be created: ${error.message}`,true); }
  finally { refreshSummary(); }
};
function setTheme(theme) { document.documentElement.dataset.theme = theme; $('theme').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode'; try { sessionStorage.setItem('et-theme-session',theme); } catch {} }
let preferred; try { preferred = sessionStorage.getItem('et-theme-session'); } catch {}
setTheme(preferred || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installEvent = event; $('install').hidden = false; });
$('install').onclick = async () => { if (installEvent) { await installEvent.prompt(); installEvent = null; $('install').hidden = true; } };
window.addEventListener('appinstalled', () => { $('install').hidden = true; });
window.addEventListener('beforeunload', event => { if (items.length || busy) { event.preventDefault(); event.returnValue = ''; } });
async function setupOffline() {
  if (!('serviceWorker' in navigator)) { $('offline').textContent = 'Offline storage unavailable in this browser'; return; }
  try {
    const registration = await navigator.serviceWorker.register('./sw.js', {scope:'./'});
    // Only claim readiness after
    // Stitch's own worker has installed its complete dependency cache.
    const check = () => {
      const ownWorker = registration.active;
      if (ownWorker?.state === 'activated') $('offline').textContent = navigator.onLine ? 'Offline ready' : 'Offline · ready to stitch';
    };
    check();
    const worker = registration.installing || registration.waiting;
    worker?.addEventListener('statechange', () => { check(); if (worker.state === 'redundant' && !registration.active) $('offline').textContent = 'Offline setup failed. Reopen online to retry.'; });
    navigator.serviceWorker.addEventListener('controllerchange', check);
    window.addEventListener('online', check); window.addEventListener('offline', check);
  } catch { $('offline').textContent = 'Offline setup unavailable. Reopen online to retry.'; }
}
render(); setupOffline();
