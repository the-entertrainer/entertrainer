(function () {
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const U = () => DialogueUtils;
  const F = () => DialogueFormats;

  const state = {
    route: 'home',
    projects: [],
    currentId: null,
    editor: null,
    wizard: { formatId: 'webtoon', layoutId: 'stack3', start: null },
    ctxProjectId: null,
    letteringNodeId: null,
    settings: {
      theme: 'system',
      defaultFormat: 'webtoon',
      autosave: true,
      reduceMotion: false,
      exportQuality: 0.92,
    },
  };

  function showScreen(name) {
    state.route = name;
    $$('.screen').forEach((s) => s.classList.toggle('active', s.dataset.screen === name));
    if (name === 'home') refreshShelf();
    if (name === 'settings') renderSettings();
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
      try { await navigator.serviceWorker.register('./sw.js', { scope: './' }); } catch (_) {}
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
    document.documentElement.dataset.theme = s.theme === 'system' ? '' : s.theme;
    if (s.theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = s.theme;
    document.documentElement.dataset.reduceMotion = s.reduceMotion ? '1' : '0';
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
      showScreen('home');
    });
    $('#btn-undo').addEventListener('click', () => state.editor && state.editor.undo());
    $('#btn-redo').addEventListener('click', () => state.editor && state.editor.redo());
    $('#btn-preview').addEventListener('click', () => openReader());
    $('#btn-export').addEventListener('click', () => openExportSheet());
    $$('.dock button').forEach((b) => b.addEventListener('click', () => setDock(b.dataset.dock)));
    $('#lettering-save').addEventListener('click', saveLettering);
    $('#lettering-cancel').addEventListener('click', () => $('#lettering-sheet').classList.remove('open'));
    $('#export-close').addEventListener('click', () => $('#export-sheet').classList.remove('open'));
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
    // wizard chips
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
      $$('#wizard-start .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.wizard.start = c.dataset.id;
    }));
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
      card.innerHTML = `<img class="cover" alt="" src="${cover || './icons/icon-512.png'}"/><div class="meta">${escapeHtml(p.title)}</div>`;
      card.addEventListener('click', () => openEditor(p.id));
      let pressTimer;
      const openMenu = (e) => {
        e.preventDefault();
        state.ctxProjectId = p.id;
        const menu = $('#ctx-menu');
        menu.classList.add('open');
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

  function openWizard() {
    state.wizard = { formatId: state.settings.defaultFormat || 'webtoon', layoutId: 'stack3', start: null };
    showScreen('wizard');
  }

  async function createFromWizard() {
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
    if (state.wizard.start === 'camera' || state.wizard.start === 'photos') {
      // open editor then prompt file
      await openEditor(project.id);
      setTimeout(() => {
        setDock('art');
        if (state.wizard.start === 'camera') $('#file-camera')?.click();
        else $('#file-photos')?.click();
      }, 400);
    } else {
      await openEditor(project.id);
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
      onSelect() { renderTray(); renderFilmstrip(); },
      onRedraw(b) { renderFilmstrip(b); },
      onBalloonTap() {},
      onBalloonEdit(n) { openLettering(n); },
    });
    state.editor.loadBundle(bundle);
    setDock('panels');
    renderFilmstrip(bundle);
  }

  function destroyEditor() {
    if (state.editor) {
      state.editor.destroy();
      state.editor = null;
    }
  }

  function setDock(name) {
    $$('.dock button').forEach((b) => b.classList.toggle('active', b.dataset.dock === name));
    const tray = $('#tray');
    tray.classList.add('open');
    tray.dataset.mode = name;
    renderTray();
  }

  function renderTray() {
    const tray = $('#tray');
    const mode = tray.dataset.mode || 'panels';
    const sel = state.editor ? state.editor.getSelection() : {};
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
        <p class="camera-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>`;
    } else if (mode === 'balloon') {
      html = `
        <button type="button" data-act="speech">Speech</button>
        <button type="button" data-act="thought">Thought</button>
        <button type="button" data-act="caption">Caption</button>
        <button type="button" data-act="edit-text">Edit text</button>`;
    } else if (mode === 'type') {
      html = `<button type="button" data-act="edit-text">Lettering sheet</button>
        <button type="button" class="soon" disabled>Fonts Soon</button>`;
    } else if (mode === 'stickers') {
      const names = ['burst.svg','heart.svg','pow.svg','bam.svg','sweat.svg','speed-lines.svg','sparkle.svg','exclaim.svg','question.svg','impact-lines.svg','anger-vein.svg','music-note.svg','zzzz.svg','cloud-puff.svg','motion-arc.svg','hearts-mini.svg'];
      html = names.map((n) => `<button type="button" data-sticker="./stickers/${n}" title="${n}"><img src="./stickers/${n}" alt="" width="36" height="36"/></button>`).join('');
    } else if (mode === 'frames') {
      html = `<button type="button" class="soon" disabled>Frames Soon</button>
        <button type="button" class="soon" disabled>Borders Soon</button>`;
    }
    tray.innerHTML = html;
    tray.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', onTrayAct));
    tray.querySelectorAll('[data-sticker]').forEach((b) => b.addEventListener('click', () => {
      state.editor.addSticker(b.dataset.sticker);
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
    if (act === 'add-panel') ed.addPanel();
    if (act === 'dup-panel') ed.duplicatePanel();
    if (act === 'del') ed.deleteSelected();
    if (act === 'up') {
      const s = ed.getSelection();
      if (s.kind === 'panel') ed.reorderPanel(s.id, -1);
    }
    if (act === 'down') {
      const s = ed.getSelection();
      if (s.kind === 'panel') ed.reorderPanel(s.id, 1);
    }
    if (act === 'fit') ed.setFit('contain');
    if (act === 'fill') ed.setFit('cover');
    if (act === 'speech') ed.addBalloon('speech');
    if (act === 'thought') ed.addBalloon('thought');
    if (act === 'caption') ed.addBalloon('caption');
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
    for (const file of files) {
      const dataURL = await U().blobToDataURL(file);
      const asset = {
        id: U().uid('asset'),
        projectId: state.currentId,
        mime: file.type || 'image/jpeg',
        name: file.name || 'photo.jpg',
        dataURL,
        createdAt: U().now(),
      };
      state.editor.setPanelArt(asset, 'cover');
      // for multi, add panel then art
      if (files.indexOf(file) < files.length - 1) state.editor.addPanel();
    }
  }

  function renderFilmstrip(b) {
    const strip = $('#filmstrip');
    const bundle = b || (state.editor && state.editor.getBundle());
    if (!bundle) { strip.innerHTML = ''; return; }
    const sel = state.editor.getSelection();
    strip.innerHTML = (bundle.panels || []).slice().sort((a, c) => a.order - c.order).map((p) => {
      const active = sel.kind === 'panel' && sel.id === p.id ? 'active' : '';
      const bg = p.placeholderColor || '#ccc';
      return `<button type="button" class="thumb ${active}" data-id="${p.id}" style="background:${bg}"></button>`;
    }).join('');
    strip.querySelectorAll('.thumb').forEach((t) => t.addEventListener('click', () => {
      state.editor.select('panel', t.dataset.id);
    }));
  }

  function openLettering(n) {
    state.letteringNodeId = n.id;
    $('#lettering-text').value = n.text === 'Say something' ? '' : (n.text || '');
    $('#lettering-sheet').classList.add('open');
    $('#lettering-text').focus();
  }
  function saveLettering() {
    const text = $('#lettering-text').value.trim() || 'Say something';
    if (state.editor && state.letteringNodeId) {
      state.editor.setBalloonText(state.letteringNodeId, text);
    }
    $('#lettering-sheet').classList.remove('open');
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
    $('#export-sheet').classList.add('open');
    $('#export-progress').style.width = '0%';
    $('#export-status').textContent = 'Choose a format';
  }

  async function runExport(kind) {
    if (!state.editor) return;
    state.editor.flushAutosave();
    const bundle = state.editor.getBundle();
    const assetMap = {};
    (bundle.assets || []).forEach((a) => { assetMap[a.id] = a; });
    const title = (bundle.project.title || 'comic').replace(/[^\w\-]+/g, '_');
    const onProgress = (p) => {
      $('#export-progress').style.width = Math.round(p * 100) + '%';
    };
    $('#export-status').textContent = 'Exporting…';
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
    } catch (err) {
      console.error(err);
      $('#export-status').textContent = 'Export failed: ' + (err && err.message ? err.message : err);
    }
  }

  // context menu actions
  window.DialogueAppActions = {
    async duplicate() {
      if (!state.ctxProjectId) return;
      await DialogueDB.duplicateProject(state.ctxProjectId);
      $('#ctx-menu').classList.remove('open');
      refreshShelf();
    },
    async rename() {
      if (!state.ctxProjectId) return;
      const bundle = await DialogueDB.getProjectBundle(state.ctxProjectId);
      const title = prompt('Rename comic', bundle.project.title);
      if (title) {
        bundle.project.title = title.trim() || bundle.project.title;
        await DialogueDB.saveProjectBundle(bundle);
      }
      $('#ctx-menu').classList.remove('open');
      refreshShelf();
    },
    async remove() {
      if (!state.ctxProjectId) return;
      if (confirm('Delete this comic?')) {
        await DialogueDB.deleteProject(state.ctxProjectId);
      }
      $('#ctx-menu').classList.remove('open');
      refreshShelf();
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
    $('#set-reset').onclick = async () => {
      if (confirm('Erase all local Dialogue comics and settings?')) {
        await DialogueDB.resetAll();
        location.reload();
      }
    };
  }

  // title edit
  document.addEventListener('DOMContentLoaded', () => {
    init().catch((e) => console.error(e));
    const title = $('#editor-title');
    title.addEventListener('click', async () => {
      if (!state.editor) return;
      const b = state.editor.getBundle();
      const next = prompt('Title', b.project.title);
      if (next != null) {
        b.project.title = next.trim() || b.project.title;
        title.textContent = b.project.title;
        state.editor.markDirty();
        await DialogueDB.saveProjectBundle(b, { replaceChildren: true });
      }
    });
  });
})();
