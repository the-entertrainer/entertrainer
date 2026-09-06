(function () {
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const U = () => DialogueUtils;
  const F = () => DialogueFormats;

  const STICKERS = [
    'burst.svg', 'heart.svg', 'pow.svg', 'bam.svg', 'sweat.svg', 'speed-lines.svg',
    'sparkle.svg', 'exclaim.svg', 'question.svg', 'impact-lines.svg', 'anger-vein.svg',
    'music-note.svg', 'zzzz.svg', 'cloud-puff.svg', 'motion-arc.svg', 'hearts-mini.svg',
  ];

  const state = {
    route: 'home',
    projects: [],
    currentId: null,
    editor: null,
    wizard: { formatId: 'webtoon', layoutId: 'stack3', start: null },
    ctxProjectId: null,
    letteringNodeId: null,
    letteringSize: 22,
    dockTool: null,
    trayOpen: false,
    exporting: false,
    renameTarget: null, // 'project' | 'title' | ctx
    confirmAction: null,
    settings: {
      theme: 'system',
      defaultFormat: 'webtoon',
      autosave: true,
      reduceMotion: false,
      exportQuality: 0.92,
    },
  };

  function haptic(ms) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 10);
    } catch (_) {}
  }

  function showScreen(name) {
    state.route = name;
    $$('.screen').forEach((s) => s.classList.toggle('active', s.dataset.screen === name));
    if (name === 'home') refreshShelf();
    if (name === 'settings') renderSettings();
    // Hide settings fab on non-home via CSS :has — also toggle class for older browsers
    const fab = $('#btn-settings');
    if (fab) fab.classList.toggle('hidden', name !== 'home');
  }

  async function init() {
    applySettings(await loadSettings());
    await DialogueDemo.ensureDemo();
    bindUI();
    showScreen('home');
    const draft = await DialogueDB.getMeta('restoreBanner', null);
    if (draft && draft.projectId) {
      const ban = $('#restore-banner');
      ban.classList.add('show');
      ban.dataset.projectId = draft.projectId;
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && state.editor) state.editor.flushAutosave();
    });
    window.addEventListener('pagehide', () => {
      if (state.editor) state.editor.flushAutosave();
    });
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/dialogue/sw.js', { scope: '/dialogue/' });
      } catch (_) {}
    }
  }

  async function loadSettings() {
    const s = await DialogueDB.getMeta('settings', null);
    if (s) Object.assign(state.settings, s);
    return state.settings;
  }
  async function saveSettings() {
    await DialogueDB.setMeta('settings', state.settings);
    applySettings(state.settings);
  }
  function applySettings(s) {
    if (s.theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = s.theme;
    document.documentElement.dataset.reduceMotion = s.reduceMotion ? '1' : '0';
  }

  function openSheet(id) {
    closeAllSheets();
    const dim = $('#sheet-dimmer');
    dim.hidden = false;
    requestAnimationFrame(() => dim.classList.add('show'));
    $('#' + id).classList.add('open');
  }
  function closeSheet(id) {
    const el = $('#' + id);
    if (el) el.classList.remove('open');
    const anyOpen = $$('.sheet.open').length > 0;
    if (!anyOpen) {
      const dim = $('#sheet-dimmer');
      dim.classList.remove('show');
      setTimeout(() => { if (!$$('.sheet.open').length) dim.hidden = true; }, 200);
    }
  }
  function closeAllSheets() {
    $$('.sheet.open').forEach((s) => s.classList.remove('open'));
    const dim = $('#sheet-dimmer');
    dim.classList.remove('show');
    dim.hidden = true;
  }

  function bindUI() {
    $('#btn-new').addEventListener('click', () => openWizard());
    $('#btn-settings').addEventListener('click', () => showScreen('settings'));
    $('#settings-back').addEventListener('click', () => showScreen('home'));
    $('#wizard-cancel').addEventListener('click', () => showScreen('home'));
    $('#wizard-create').addEventListener('click', () => createFromWizard());
    $('#editor-back').addEventListener('click', async () => {
      if (state.editor) state.editor.flushAutosave();
      destroyEditor();
      closeTray();
      showScreen('home');
    });
    $('#btn-undo').addEventListener('click', () => { if (state.editor) { state.editor.undo(); haptic(8); } });
    $('#btn-redo').addEventListener('click', () => { if (state.editor) { state.editor.redo(); haptic(8); } });
    $('#btn-preview').addEventListener('click', () => openReader());
    $('#btn-export').addEventListener('click', () => openExportSheet());
    $$('.dock button').forEach((b) => b.addEventListener('click', () => toggleDock(b.dataset.dock)));

    $('#lettering-save').addEventListener('click', saveLettering);
    $('#lettering-cancel').addEventListener('click', () => closeSheet('lettering-sheet'));
    $$('#lettering-sizes .size-chip').forEach((c) => c.addEventListener('click', () => {
      $$('#lettering-sizes .size-chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.letteringSize = Number(c.dataset.size) || 22;
    }));

    $('#export-close').addEventListener('click', () => { if (!state.exporting) closeSheet('export-sheet'); });
    $$('.export-row').forEach((row) => row.addEventListener('click', () => {
      const kind = row.dataset.export;
      if (kind) runExport(kind);
    }));

    $('#rename-save').addEventListener('click', commitRename);
    $('#rename-cancel').addEventListener('click', () => closeSheet('rename-sheet'));
    $('#confirm-yes').addEventListener('click', commitConfirm);
    $('#confirm-no').addEventListener('click', () => closeSheet('confirm-sheet'));

    $('#sheet-dimmer').addEventListener('click', () => {
      if (state.exporting) return;
      closeAllSheets();
    });

    $('#ctx-close').addEventListener('click', () => $('#ctx-menu').classList.remove('open'));
    $('#restore-yes').addEventListener('click', async () => {
      const id = $('#restore-banner').dataset.projectId;
      $('#restore-banner').classList.remove('show');
      await DialogueDB.setMeta('restoreBanner', null);
      if (id) openEditor(id);
    });
    $('#restore-no').addEventListener('click', async () => {
      $('#restore-banner').classList.remove('show');
      await DialogueDB.setMeta('restoreBanner', null);
    });
    $('#reader-close').addEventListener('click', () => $('#reader').classList.remove('open'));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#ctx-menu') && !e.target.closest('.comic-card')) {
        $('#ctx-menu').classList.remove('open');
      }
    });

    $$('#wizard-formats .chip').forEach((c) => c.addEventListener('click', () => {
      $$('#wizard-formats .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.wizard.formatId = c.dataset.id;
    }));
    $$('#wizard-layouts .chip').forEach((c) => c.addEventListener('click', () => {
      $$('#wizard-layouts .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.wizard.layoutId = c.dataset.id;
    }));
    $$('#wizard-start .chip').forEach((c) => c.addEventListener('click', () => {
      if (c.disabled) return;
      $$('#wizard-start .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.wizard.start = c.dataset.id;
    }));

    const title = $('#editor-title');
    title.addEventListener('click', () => {
      if (!state.editor) return;
      const b = state.editor.getBundle();
      openRenameSheet(b.project.title, 'title');
    });
  }

  async function refreshShelf() {
    state.projects = await DialogueDB.listProjects();
    const grid = $('#recents');
    const empty = $('#empty-state');
    grid.innerHTML = '';
    if (!state.projects.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    for (const p of state.projects) {
      const card = document.createElement('button');
      card.className = 'comic-card';
      card.type = 'button';
      let cover = '';
      if (p.coverAssetId) {
        const a = await DialogueDB.getAsset(p.coverAssetId);
        if (a && a.dataURL) cover = a.dataURL;
      }
      const fallback = '/dialogue/icons/icon-512.png';
      card.innerHTML = `<img class="cover" alt="" src="${cover || fallback}"/><div class="meta">${escapeHtml(p.title)}</div>`;
      card.addEventListener('click', () => openEditor(p.id));
      let pressTimer;
      const openMenu = (e) => {
        e.preventDefault();
        state.ctxProjectId = p.id;
        $('#ctx-menu').classList.add('open');
        haptic(12);
      };
      card.addEventListener('contextmenu', openMenu);
      card.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => openMenu(e), 480);
      }, { passive: true });
      card.addEventListener('touchend', () => clearTimeout(pressTimer));
      card.addEventListener('touchmove', () => clearTimeout(pressTimer));
      grid.appendChild(card);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function syncWizardChips() {
    $$('#wizard-formats .chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.id === state.wizard.formatId);
    });
    $$('#wizard-layouts .chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.id === state.wizard.layoutId);
    });
    $$('#wizard-start .chip').forEach((c) => {
      const isScript = c.dataset.id === 'script';
      if (isScript) {
        c.disabled = true;
        c.classList.add('chip-disabled');
        c.classList.remove('active');
        return;
      }
      c.classList.toggle('active', c.dataset.id === state.wizard.start);
    });
  }

  function openWizard() {
    state.wizard = {
      formatId: state.settings.defaultFormat || 'webtoon',
      layoutId: 'stack3',
      start: null,
    };
    syncWizardChips();
    showScreen('wizard');
  }

  async function createFromWizard() {
    haptic(10);
    const format = F().FORMATS[state.wizard.formatId] || F().FORMATS.webtoon;
    const layout = F().LAYOUTS[state.wizard.layoutId] || F().LAYOUTS.stack3;
    const rects = F().layoutRects(format, layout);
    const g = F().gutterForWidth(format.width);
    const height = rects.length
      ? rects[rects.length - 1].y + rects[rects.length - 1].h + g
      : F().defaultPageHeight(format, 1);
    const project = DialogueDB.emptyProject({
      title: 'Untitled',
      formatId: format.id,
      width: format.width,
      height: format.infinite ? height : format.height,
    });
    const page = {
      id: U().uid('page'), projectId: project.id, order: 0,
      width: format.width, height: project.height,
    };
    const panels = rects.map((r, i) => ({
      id: U().uid('panel'), pageId: page.id, order: i,
      x: r.x, y: r.y, w: r.w, h: r.h,
      fit: 'cover', artX: 0, artY: 0, artScale: 1,
      placeholderColor: '#d5cbbd',
    }));
    await DialogueDB.saveProjectBundle({ project, pages: [page], panels, nodes: [], assets: [] });
    await openEditor(project.id);
    if (state.wizard.start === 'camera' || state.wizard.start === 'photos') {
      setTimeout(() => {
        openDock('art');
        setTimeout(() => {
          if (state.wizard.start === 'camera') $('#file-camera')?.click();
          else $('#file-photos')?.click();
        }, 120);
      }, 350);
    }
  }

  async function openEditor(projectId) {
    const bundle = await DialogueDB.getProjectBundle(projectId);
    if (!bundle) return;
    state.currentId = projectId;
    showScreen('editor');
    $('#editor-title').textContent = bundle.project.title;
    const host = $('#konva-container');
    host.innerHTML = '';
    destroyEditor();
    closeTray();
    state.dockTool = null;
    $$('.dock button').forEach((b) => b.classList.remove('active'));

    state.editor = DialogueEditor.createEditor(host, {
      autosaveEnabled: state.settings.autosave,
      onDirty() {
        $('#btn-undo').disabled = !state.editor.canUndo();
        $('#btn-redo').disabled = !state.editor.canRedo();
      },
      async onAutosave(b) {
        await DialogueDB.saveProjectBundle(b, { replaceChildren: true });
        await DialogueDB.setMeta('restoreBanner', { projectId: b.project.id, at: Date.now() });
        $('#editor-title').textContent = b.project.title;
      },
      onSelect() { renderFilmstrip(); },
      onRedraw(b) { renderFilmstrip(b); },
      onBalloonTap() {},
      onBalloonEdit(n) { openLettering(n); },
    });
    await state.editor.whenReady();
    state.editor.loadBundle(bundle);
    // Force a refit after layout settles (tray closed = max canvas)
    requestAnimationFrame(() => {
      if (state.editor) state.editor.resize();
    });
    renderFilmstrip(bundle);
    $('#btn-undo').disabled = true;
    $('#btn-redo').disabled = true;
  }

  function destroyEditor() {
    if (state.editor) {
      state.editor.destroy();
      state.editor = null;
    }
  }

  function closeTray() {
    state.trayOpen = false;
    const tray = $('#tray');
    tray.classList.remove('open');
    $$('.dock button').forEach((b) => {
      if (b.dataset.dock !== state.dockTool) b.classList.remove('active');
      if (!state.dockTool) b.classList.remove('active');
    });
    if (state.editor) {
      requestAnimationFrame(() => state.editor && state.editor.resize());
    }
  }

  function openDock(name) {
    state.dockTool = name;
    state.trayOpen = true;
    $$('.dock button').forEach((b) => b.classList.toggle('active', b.dataset.dock === name));
    const tray = $('#tray');
    tray.classList.add('open');
    tray.dataset.mode = name;
    renderTray();
    if (state.editor) {
      requestAnimationFrame(() => state.editor && state.editor.resize());
    }
  }

  function toggleDock(name) {
    // Second tap on same tool closes tray
    if (state.trayOpen && state.dockTool === name) {
      state.dockTool = null;
      closeTray();
      $$('.dock button').forEach((b) => b.classList.remove('active'));
      haptic(8);
      return;
    }
    openDock(name);
    haptic(8);
  }

  function renderTray() {
    const body = $('#tray-body');
    const mode = $('#tray').dataset.mode || 'panels';
    let html = '';
    if (mode === 'panels') {
      html = `
        <button type="button" data-act="add-panel">Add panel</button>
        <button type="button" data-act="dup-panel">Duplicate</button>
        <button type="button" data-act="del">Delete</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>`;
    } else if (mode === 'art') {
      html = `
        <label class="file-btn">Camera<input id="file-camera" class="sr-only" type="file" accept="image/*" capture="environment"/></label>
        <label class="file-btn">Photos<input id="file-photos" class="sr-only" type="file" accept="image/*" multiple/></label>
        <button type="button" data-act="fit">Fit</button>
        <button type="button" data-act="fill">Fill</button>
        <p class="tray-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>`;
    } else if (mode === 'balloon') {
      html = `
        <button type="button" data-act="speech">Speech</button>
        <button type="button" data-act="thought">Thought</button>
        <button type="button" data-act="caption">Caption</button>
        <button type="button" data-act="edit-text">Edit text</button>`;
    } else if (mode === 'stickers') {
      html = STICKERS.map((n) =>
        `<button type="button" data-sticker="/dialogue/stickers/${n}" title="${n}"><img src="/dialogue/stickers/${n}" alt="" width="36" height="36"/></button>`
      ).join('');
    }
    body.innerHTML = html;
    body.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', onTrayAct));
    body.querySelectorAll('[data-sticker]').forEach((b) => b.addEventListener('click', () => {
      if (!state.editor) return;
      state.editor.addSticker(b.dataset.sticker);
      haptic(10);
    }));
    const cam = $('#file-camera');
    const photos = $('#file-photos');
    if (cam) cam.addEventListener('change', (e) => handleFiles(e.target.files));
    if (photos) photos.addEventListener('change', (e) => handleFiles(e.target.files));
  }

  async function onTrayAct(e) {
    const act = e.currentTarget.dataset.act;
    const ed = state.editor;
    if (!ed) return;
    if (act === 'add-panel') { ed.addPanel(); haptic(10); }
    if (act === 'dup-panel') { ed.duplicatePanel(); haptic(10); }
    if (act === 'del') { ed.deleteSelected(); haptic(10); }
    if (act === 'up') {
      const s = ed.getSelection();
      if (s.kind === 'panel') { ed.reorderPanel(s.id, -1); haptic(10); }
    }
    if (act === 'down') {
      const s = ed.getSelection();
      if (s.kind === 'panel') { ed.reorderPanel(s.id, 1); haptic(10); }
    }
    if (act === 'fit') ed.setFit('contain');
    if (act === 'fill') ed.setFit('cover');
    if (act === 'speech') { ed.addBalloon('speech'); haptic(10); }
    if (act === 'thought') { ed.addBalloon('thought'); haptic(10); }
    if (act === 'caption') { ed.addBalloon('caption'); haptic(10); }
    if (act === 'edit-text') {
      const s = ed.getSelection();
      const b = ed.getBundle();
      const n = (b.nodes || []).find((x) => x.id === s.id);
      if (n) openLettering(n);
    }
  }

  async function handleFiles(fileList) {
    if (!fileList || !fileList.length || !state.editor) return;
    const files = Array.from(fileList);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataURL = await U().blobToDataURL(file);
      const asset = {
        id: U().uid('asset'),
        projectId: state.currentId,
        mime: file.type || 'image/jpeg',
        name: file.name || 'photo.jpg',
        dataURL,
        createdAt: U().now(),
      };
      // ensurePanelForArt is inside setPanelArt
      state.editor.setPanelArt(asset, 'cover');
      haptic(10);
      if (i < files.length - 1) state.editor.addPanel();
    }
  }

  function renderFilmstrip(b) {
    const strip = $('#filmstrip');
    const bundle = b || (state.editor && state.editor.getBundle());
    if (!bundle || !state.editor) { strip.innerHTML = ''; return; }
    const sel = state.editor.getSelection();
    const panels = (bundle.panels || []).slice().sort((a, c) => a.order - c.order);
    let html = panels.map((p, i) => {
      const active = sel.kind === 'panel' && sel.id === p.id ? 'active' : '';
      let thumbInner = '';
      if (p.artAssetId) {
        const a = (bundle.assets || []).find((x) => x.id === p.artAssetId);
        if (a && a.dataURL) {
          thumbInner = `<img alt="" src="${a.dataURL}"/><span class="idx">${i + 1}</span>`;
        } else {
          thumbInner = `<span class="idx">${i + 1}</span>`;
        }
      } else {
        thumbInner = `<span class="idx">${i + 1}</span>`;
      }
      const bg = p.artAssetId ? '' : `style="background:${p.placeholderColor || '#cfc4b4'}"`;
      return `<button type="button" class="thumb ${active}" data-id="${p.id}" ${bg}>${thumbInner}</button>`;
    }).join('');
    html += `<button type="button" class="thumb thumb-add" data-add="1" aria-label="Add panel">＋</button>`;
    strip.innerHTML = html;
    strip.querySelectorAll('.thumb[data-id]').forEach((t) => t.addEventListener('click', () => {
      state.editor.select('panel', t.dataset.id);
      state.editor.scrollToPanel(t.dataset.id);
      haptic(8);
    }));
    const addBtn = strip.querySelector('[data-add]');
    if (addBtn) addBtn.addEventListener('click', () => {
      state.editor.addPanel();
      haptic(10);
    });
  }

  function openLettering(n) {
    state.letteringNodeId = n.id;
    state.letteringSize = n.fontSize || 22;
    $('#lettering-text').value = n.text === 'Say something' ? '' : (n.text || '');
    $$('#lettering-sizes .size-chip').forEach((c) => {
      c.classList.toggle('active', Number(c.dataset.size) === state.letteringSize);
    });
    openSheet('lettering-sheet');
    setTimeout(() => {
      const ta = $('#lettering-text');
      ta.focus();
      const len = ta.value.length;
      try { ta.setSelectionRange(len, len); } catch (_) {}
    }, 80);
  }

  function saveLettering() {
    const text = $('#lettering-text').value.trim() || 'Say something';
    if (state.editor && state.letteringNodeId) {
      state.editor.setBalloonText(state.letteringNodeId, text, state.letteringSize);
      haptic(10);
    }
    closeSheet('lettering-sheet');
  }

  async function openReader() {
    if (!state.editor) return;
    state.editor.flushAutosave();
    const bundle = state.editor.getBundle();
    const assetMap = {};
    (bundle.assets || []).forEach((a) => { assetMap[a.id] = a; });
    const canvas = await DialogueExport.renderBundleToCanvas(bundle, assetMap);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    const reader = $('#reader');
    $('#reader-scroll').innerHTML = `<img class="page-img" alt="Comic" src="${url}"/>`;
    reader.classList.add('open');
  }

  function openExportSheet() {
    state.exporting = false;
    $('#export-progress').style.width = '0%';
    $('#export-status').textContent = 'Choose a format';
    $$('.export-row').forEach((r) => { r.disabled = false; });
    openSheet('export-sheet');
  }

  async function runExport(kind) {
    if (!state.editor || state.exporting) return;
    state.exporting = true;
    $$('.export-row').forEach((r) => { r.disabled = true; });
    $('#export-close').disabled = true;
    state.editor.flushAutosave();
    const bundle = state.editor.getBundle();
    const assetMap = {};
    (bundle.assets || []).forEach((a) => { assetMap[a.id] = a; });
    const title = (bundle.project.title || 'comic').replace(/[^\w\-]+/g, '_');
    const onProgress = (p) => {
      $('#export-progress').style.width = Math.round(p * 100) + '%';
    };
    $('#export-status').textContent = 'Inking the pages…';
    try {
      let blob, name;
      if (kind === 'png') {
        blob = await DialogueExport.exportPNG(bundle, assetMap);
        name = title + '.png';
      } else if (kind === 'jpg') {
        blob = await DialogueExport.exportJPG(bundle, assetMap, state.settings.exportQuality);
        name = title + '.jpg';
      } else if (kind === 'webtoon') {
        blob = await DialogueExport.exportWebtoonZip(bundle, assetMap, onProgress);
        name = title + '-webtoon.zip';
      } else if (kind === 'pdf') {
        blob = await DialogueExport.exportPDF(bundle, assetMap, onProgress);
        name = title + '.pdf';
      } else if (kind === 'dialogue') {
        blob = await DialogueExport.projectZip(bundle, assetMap, onProgress);
        name = title + '.dialogue';
      }
      onProgress(1);
      U().downloadBlob(blob, name);
      $('#export-status').textContent = 'Saved ' + name;
      haptic(10);
    } catch (err) {
      console.error(err);
      $('#export-status').textContent = 'Export failed: ' + (err && err.message ? err.message : err);
    } finally {
      state.exporting = false;
      $$('.export-row').forEach((r) => { r.disabled = false; });
      $('#export-close').disabled = false;
    }
  }

  function openRenameSheet(current, target) {
    state.renameTarget = target;
    $('#rename-input').value = current || '';
    openSheet('rename-sheet');
    setTimeout(() => {
      const inp = $('#rename-input');
      inp.focus();
      inp.select();
    }, 80);
  }

  async function commitRename() {
    const title = ($('#rename-input').value || '').trim();
    if (!title) { closeSheet('rename-sheet'); return; }
    haptic(10);
    if (state.renameTarget === 'title' && state.editor) {
      const b = state.editor.getBundle();
      b.project.title = title;
      $('#editor-title').textContent = title;
      state.editor.markDirty();
      await DialogueDB.saveProjectBundle(b, { replaceChildren: true });
    } else if (state.renameTarget === 'ctx' && state.ctxProjectId) {
      const bundle = await DialogueDB.getProjectBundle(state.ctxProjectId);
      if (bundle) {
        bundle.project.title = title;
        await DialogueDB.saveProjectBundle(bundle);
        refreshShelf();
      }
    }
    closeSheet('rename-sheet');
    $('#ctx-menu').classList.remove('open');
  }

  function openConfirm(title, message, action) {
    state.confirmAction = action;
    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    openSheet('confirm-sheet');
  }

  async function commitConfirm() {
    const action = state.confirmAction;
    state.confirmAction = null;
    closeSheet('confirm-sheet');
    if (typeof action === 'function') {
      haptic(10);
      await action();
    }
  }

  window.DialogueAppActions = {
    async duplicate() {
      if (!state.ctxProjectId) return;
      await DialogueDB.duplicateProject(state.ctxProjectId);
      $('#ctx-menu').classList.remove('open');
      haptic(10);
      refreshShelf();
    },
    async rename() {
      if (!state.ctxProjectId) return;
      const bundle = await DialogueDB.getProjectBundle(state.ctxProjectId);
      $('#ctx-menu').classList.remove('open');
      if (!bundle) return;
      openRenameSheet(bundle.project.title, 'ctx');
    },
    async remove() {
      if (!state.ctxProjectId) return;
      const id = state.ctxProjectId;
      $('#ctx-menu').classList.remove('open');
      openConfirm('Delete comic?', 'This cannot be undone.', async () => {
        await DialogueDB.deleteProject(id);
        refreshShelf();
      });
    },
    async exportProj() {
      const id = state.ctxProjectId;
      $('#ctx-menu').classList.remove('open');
      if (!id) return;
      await openEditor(id);
      openExportSheet();
    },
    runExport,
  };

  function renderSettings() {
    const root = $('#settings-body');
    const s = state.settings;
    root.innerHTML = `
      <div class="row"><label>Theme</label>
        <select id="set-theme">
          <option value="system" ${s.theme==='system'?'selected':''}>System</option>
          <option value="light" ${s.theme==='light'?'selected':''}>Light</option>
          <option value="dark" ${s.theme==='dark'?'selected':''}>Dark</option>
        </select></div>
      <div class="row"><label>Default format</label>
        <select id="set-format">
          ${Object.values(F().FORMATS).map((f)=>`<option value="${f.id}" ${s.defaultFormat===f.id?'selected':''}>${f.label}</option>`).join('')}
        </select></div>
      <div class="row"><label>Autosave</label><input type="checkbox" id="set-autosave" ${s.autosave?'checked':''}/></div>
      <div class="row"><label>Reduce motion</label><input type="checkbox" id="set-motion" ${s.reduceMotion?'checked':''}/></div>
      <div class="row"><label>Export quality</label>
        <input type="range" id="set-quality" min="0.6" max="1" step="0.02" value="${s.exportQuality}"/></div>
      <div class="row soon"><label>Frames</label><span>Soon</span></div>
      <div class="row"><button type="button" id="set-reset" class="btn-primary">Reset local data</button></div>
      <div class="row soon"><label>Cloud sync</label><span>Soon</span></div>
      <div class="row soon"><label>Pressure pen</label><span>Soon</span></div>
      <div class="row"><label>About</label><span>Dialogue — Comics from your pocket.</span></div>
      <p class="camera-note">Camera: Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>
    `;
    $('#set-theme').onchange = async (e) => { s.theme = e.target.value; await saveSettings(); };
    $('#set-format').onchange = async (e) => { s.defaultFormat = e.target.value; await saveSettings(); };
    $('#set-autosave').onchange = async (e) => { s.autosave = e.target.checked; await saveSettings(); };
    $('#set-motion').onchange = async (e) => { s.reduceMotion = e.target.checked; await saveSettings(); };
    $('#set-quality').oninput = async (e) => { s.exportQuality = Number(e.target.value); await saveSettings(); };
    $('#set-reset').onclick = () => {
      openConfirm('Reset local data?', 'Erase all local Dialogue comics and settings?', async () => {
        await DialogueDB.resetAll();
        location.reload();
      });
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    init().catch((e) => console.error(e));
  });
})();
