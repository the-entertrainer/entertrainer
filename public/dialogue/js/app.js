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
    stories: [],
    currentId: null,
    currentStoryId: null,
    storyBusy: false,
    storyDensity: 'studio',
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
      haptic: true,
    },
    letteringAlign: 'center',
    letteringCaps: false,
  };

  function icon(name, cls) {
    const span = document.createElement('span');
    span.className = cls || 'ico';
    span.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = '/dialogue/icons/ui/' + name + '.svg';
    img.alt = '';
    img.width = 24;
    img.height = 24;
    img.decoding = 'async';
    span.appendChild(img);
    return span;
  }
  function iconHtml(name, cls) {
    const c = cls ? ' class="' + cls + '"' : ' class="ico"';
    return '<span' + c + ' aria-hidden="true"><img src="/dialogue/icons/ui/' + name + '.svg" alt="" width="24" height="24"/></span>';
  }
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      if (!name) return;
      if (el.tagName === 'BUTTON' || el.tagName === 'LABEL') {
        if (!el.querySelector('img[src*="/icons/ui/"]')) el.prepend(icon(name));
        el.removeAttribute('data-icon');
      } else if (el.classList.contains('ico') || el.tagName === 'SPAN') {
        el.innerHTML = '<img src="/dialogue/icons/ui/' + name + '.svg" alt="" width="24" height="24"/>';
        el.removeAttribute('data-icon');
      }
    });
  }
  function haptic(ms) {
    try {
      if (state.settings.haptic === false) return;
      if (navigator.vibrate) navigator.vibrate(ms || 10);
    } catch (_) {}
  }
  function hideSplash() {
    const splash = document.getElementById('splash');
    if (!splash || splash.classList.contains('hide')) return;
    splash.classList.add('hide');
    setTimeout(() => { try { splash.remove(); } catch (_) {} }, 400);
  }

  function showScreen(name) {
    state.route = name;
    $$('.screen').forEach((s) => s.classList.toggle('active', s.dataset.screen === name));
    if (name === 'home') {
      refreshShelf();
      refreshStoriesShelf();
    }
    if (name === 'settings') renderSettings();
    // Hide settings fab on non-home via CSS :has — also toggle class for older browsers
    const fab = $('#btn-settings');
    if (fab) fab.classList.toggle('hidden', name !== 'home');
  }

  async function init() {
    const t0 = performance.now();
    hydrateIcons(document);
    applySettings(await loadSettings());
    await DialogueDemo.ensureDemo();
    bindUI();
    initArtQueue();
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
    const wait = Math.max(0, 700 - (performance.now() - t0));
    const maxWait = Math.max(0, 2000 - (performance.now() - t0));
    await new Promise((r) => setTimeout(r, Math.min(wait, maxWait) || wait));
    // Wait for fonts if available, but never past ~2s total
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, Math.max(0, 2000 - (performance.now() - t0)))),
        ]);
      }
    } catch (_) {}
    hideSplash();
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
    const btnNewStory = $('#btn-new-story');
    if (btnNewStory) btnNewStory.addEventListener('click', () => openStoryChat());
    const storyChatBack = $('#story-chat-back');
    if (storyChatBack) storyChatBack.addEventListener('click', () => showScreen('home'));
    const storyExpand = $('#story-expand');
    if (storyExpand) storyExpand.addEventListener('click', () => expandStory());
    const storySend = $('#story-chat-send');
    if (storySend) storySend.addEventListener('click', () => sendStoryChat());
    const storyInput = $('#story-chat-input');
    if (storyInput) storyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendStoryChat(); }
    });
    const storyDensify = $('#story-densify');
    if (storyDensify) storyDensify.addEventListener('click', () => densifyStory());
    const storyApprove = $('#story-approve');
    if (storyApprove) storyApprove.addEventListener('click', () => approveOutline());
    $$('#story-density .chip').forEach((chip) => {
      chip.addEventListener('click', () => setStoryDensity(chip.getAttribute('data-density') || 'studio'));
    });
    const storyBibleBack = $('#story-bible-back');
    if (storyBibleBack) storyBibleBack.addEventListener('click', () => showScreen('story-chat'));
    const storyGenPages = $('#story-gen-pages');
    if (storyGenPages) storyGenPages.addEventListener('click', () => generateStoryPages());
    const storyEnrichCast = $('#story-enrich-cast');
    if (storyEnrichCast) storyEnrichCast.addEventListener('click', () => enrichStoryCast());
    const storyPagesBack = $('#story-pages-back');
    if (storyPagesBack) storyPagesBack.addEventListener('click', () => showScreen('story-bible'));
    const btnArtQueueStory = $('#btn-art-queue-story');
    if (btnArtQueueStory) btnArtQueueStory.addEventListener('click', () => openArtQueueFromStory());
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
    $$('#lettering-align .size-chip').forEach((c) => c.addEventListener('click', () => {
      $$('#lettering-align .size-chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      state.letteringAlign = c.dataset.align || 'center';
    }));
    const capsBtn = $('#lettering-caps');
    if (capsBtn) capsBtn.addEventListener('click', () => {
      state.letteringCaps = !state.letteringCaps;
      capsBtn.classList.toggle('active', state.letteringCaps);
      capsBtn.setAttribute('aria-pressed', state.letteringCaps ? 'true' : 'false');
    });

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
      gutter: g,
      borderWidth: 4,
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
    const ed = state.editor;
    const bundle = ed && ed.getBundle();
    const sel = ed ? ed.getSelection() : {};
    const panel = bundle && sel.kind === 'panel' ? (bundle.panels || []).find((p) => p.id === sel.id) : null;
    const gutter = (bundle && bundle.project && bundle.project.gutter) || 24;
    const borderW = (bundle && bundle.project && bundle.project.borderWidth) || 4;
    let html = '';
    if (mode === 'panels') {
      html = `
        <div class="tray-section">Panels</div>
        <button type="button" data-act="add-panel">${iconHtml('add-panel')} Add</button>
        <button type="button" data-act="dup-panel">${iconHtml('duplicate')} Dup</button>
        <button type="button" data-act="del">${iconHtml('delete')} Delete</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <div class="tray-section">Gutter</div>
        <label class="tray-slider">Width <input type="range" id="tray-gutter" min="12" max="40" step="1" value="${gutter}"/><span id="tray-gutter-val">${gutter}</span></label>
        <div class="tray-section">Border</div>
        <label class="tray-slider">Thickness <input type="range" id="tray-border" min="1" max="12" step="1" value="${borderW}"/><span id="tray-border-val">${borderW}</span></label>`;
    } else if (mode === 'art') {
      const fit = (panel && panel.fit) || 'cover';
      const opacity = Math.round(((panel && panel.artOpacity != null) ? panel.artOpacity : 1) * 100);
      html = `
        <div class="tray-section">Source</div>
        <label class="file-btn">${iconHtml('camera')} Camera<input id="file-camera" class="sr-only" type="file" accept="image/*" capture="environment"/></label>
        <label class="file-btn">${iconHtml('photos')} Photos<input id="file-photos" class="sr-only" type="file" accept="image/*" multiple/></label>
        <div class="tray-section">Fit</div>
        <button type="button" data-act="fit" class="${fit==='contain'?'active-chip':''}">${iconHtml('fit')} Fit</button>
        <button type="button" data-act="fill" class="${fit==='cover'?'active-chip':''}">${iconHtml('fill')} Fill</button>
        <button type="button" data-act="stretch" class="${fit==='stretch'?'active-chip':''}">${iconHtml('stretch')} Stretch</button>
        <div class="tray-section">Opacity</div>
        <label class="tray-slider">Art <input type="range" id="tray-opacity" min="10" max="100" step="1" value="${opacity}"/><span id="tray-opacity-val">${opacity}%</span></label>
        <button type="button" data-act="clear-art">${iconHtml('delete')} Clear art</button>
        <div class="tray-section">Mage Art Queue</div>
        <button type="button" data-act="art-queue">${iconHtml('queue')} Art Queue</button>
        <button type="button" data-act="requeue-panel">${iconHtml('queue')} Re-queue this panel</button>
        ${(panel && panel.imagePrompt) ? `<div class="tray-section">AI prompt</div>
        <p class="tray-note" style="margin:0 0 6px;max-height:4.5em;overflow:auto">${escapeHtml(panel.imagePrompt)}</p>
        <button type="button" data-act="copy-prompt">${iconHtml('copy')} Copy prompt</button>` : ''}
        <p class="tray-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone. Mage.space art is manual (copy → generate → paste).</p>`;
    } else if (mode === 'balloon') {
      html = `
        <div class="tray-section">Style</div>
        <button type="button" data-act="speech">${iconHtml('speech')} Speech</button>
        <button type="button" data-act="thought">${iconHtml('thought')} Thought</button>
        <button type="button" data-act="caption">${iconHtml('caption')} Caption</button>
        <button type="button" data-act="whisper">${iconHtml('whisper')} Whisper</button>
        <button type="button" data-act="shout">${iconHtml('shout')} Shout</button>
        <div class="tray-section">Selected</div>
        <button type="button" data-act="edit-text">${iconHtml('rename')} Edit text</button>
        <button type="button" data-act="balloon-size-s">S</button>
        <button type="button" data-act="balloon-size-m">M</button>
        <button type="button" data-act="balloon-size-l">L</button>
        <button type="button" data-act="balloon-size-xl">XL</button>
        <button type="button" data-act="align-left">${iconHtml('alignleft')}</button>
        <button type="button" data-act="align-center">${iconHtml('aligncenter')}</button>
        <button type="button" data-act="align-right">${iconHtml('alignright')}</button>
        <button type="button" data-act="toggle-caps">ALL CAPS</button>`;
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
    const gIn = $('#tray-gutter');
    if (gIn) gIn.addEventListener('input', () => {
      $('#tray-gutter-val').textContent = gIn.value;
      if (state.editor) state.editor.setGutter(Number(gIn.value));
    });
    const bIn = $('#tray-border');
    if (bIn) bIn.addEventListener('input', () => {
      $('#tray-border-val').textContent = bIn.value;
      if (state.editor) state.editor.setBorderWidth(Number(bIn.value));
    });
    const oIn = $('#tray-opacity');
    if (oIn) oIn.addEventListener('input', () => {
      const v = Number(oIn.value);
      $('#tray-opacity-val').textContent = v + '%';
      if (state.editor) state.editor.setArtOpacity(v / 100);
    });
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
    if (act === 'fit') { ed.setFit('contain'); renderTray(); }
    if (act === 'fill') { ed.setFit('cover'); renderTray(); }
    if (act === 'stretch') { ed.setFit('stretch'); renderTray(); }
    if (act === 'clear-art') { ed.clearArt(); haptic(10); renderTray(); }
    if (act === 'copy-prompt') {
      const s = ed.getSelection();
      const b = ed.getBundle();
      const p = (b.panels || []).find((x) => x.id === s.id);
      if (p && p.imagePrompt) copyPrompt(p.imagePrompt);
    }
    if (act === 'art-queue') {
      openArtQueueFromEditor();
    }
    if (act === 'requeue-panel') {
      const s = ed.getSelection();
      if (s.kind === 'panel' && s.id) openArtQueueFromEditor({ requeue: true, focusPanelId: s.id });
      else toast('Select a panel first');
    }
    if (act === 'speech') { ed.addBalloon('speech'); haptic(10); }
    if (act === 'thought') { ed.addBalloon('thought'); haptic(10); }
    if (act === 'caption') { ed.addBalloon('caption'); haptic(10); }
    if (act === 'whisper') { ed.addBalloon('whisper'); haptic(10); }
    if (act === 'shout') { ed.addBalloon('shout'); haptic(10); }
    if (act === 'balloon-size-s') ed.updateSelectedBalloon({ fontSize: 18 });
    if (act === 'balloon-size-m') ed.updateSelectedBalloon({ fontSize: 22 });
    if (act === 'balloon-size-l') ed.updateSelectedBalloon({ fontSize: 28 });
    if (act === 'balloon-size-xl') ed.updateSelectedBalloon({ fontSize: 36 });
    if (act === 'align-left') ed.updateSelectedBalloon({ align: 'left' });
    if (act === 'align-center') ed.updateSelectedBalloon({ align: 'center' });
    if (act === 'align-right') ed.updateSelectedBalloon({ align: 'right' });
    if (act === 'toggle-caps') {
      const s = ed.getSelection();
      const b = ed.getBundle();
      const n = (b.nodes || []).find((x) => x.id === s.id);
      if (n) ed.updateSelectedBalloon({ allCaps: !n.allCaps });
    }
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
    html += `<button type="button" class="thumb thumb-add" data-add="1" aria-label="Add panel">${iconHtml('filmstrip-plus')}</button>`;
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
    state.letteringAlign = n.align || 'center';
    state.letteringCaps = !!n.allCaps;
    $('#lettering-text').value = n.text === 'Say something' ? '' : (n.text || '');
    $$('#lettering-sizes .size-chip').forEach((c) => {
      c.classList.toggle('active', Number(c.dataset.size) === state.letteringSize);
    });
    $$('#lettering-align .size-chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.align === state.letteringAlign);
    });
    const capsBtn = $('#lettering-caps');
    if (capsBtn) {
      capsBtn.classList.toggle('active', state.letteringCaps);
      capsBtn.setAttribute('aria-pressed', state.letteringCaps ? 'true' : 'false');
    }
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
      state.editor.setBalloonText(state.letteringNodeId, text, state.letteringSize, {
        align: state.letteringAlign,
        allCaps: state.letteringCaps,
      });
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


  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = false;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 220);
    }, 1800);
  }

  async function copyPrompt(text) {
    const t = String(text || '').trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      toast('Prompt copied');
      haptic(10);
    } catch (_) {
      try {
        const ta = document.createElement('textarea');
        ta.value = t;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('Prompt copied');
        haptic(10);
      } catch (err) {
        toast('Copy failed');
      }
    }
  }

  async function refreshStoriesShelf() {
    const grid = $('#stories-recents');
    const label = $('#stories-label');
    if (!grid) return;
    state.stories = await DialogueDB.listStories();
    grid.innerHTML = '';
    if (!state.stories.length) {
      if (label) label.classList.add('hidden');
      return;
    }
    if (label) label.classList.remove('hidden');
    for (const s of state.stories) {
      const card = document.createElement('button');
      card.className = 'comic-card story-card';
      card.type = 'button';
      const status = s.status || 'draft';
      card.innerHTML = `<img class="cover" alt="" src="/dialogue/icons/ui/book.svg"/><div class="meta">${escapeHtml(s.title || 'Untitled Story')}<br/><span style="color:var(--muted);font-size:0.75rem;font-weight:600">${escapeHtml(status)}</span></div>`;
      card.addEventListener('click', () => resumeStory(s.id));
      grid.appendChild(card);
    }
  }

  const DENSITY_HINTS = {
    draft: 'Draft · 3–4 ch · 4–6 scenes · 4–8 panels/chapter',
    studio: 'Studio · 4–6 ch · 6–10 scenes · 12–24 panels/chapter',
    epic: 'Epic · 5–8 ch · 8–12 scenes · 24–40 panels/chapter (batched)',
  };

  function setStoryDensity(d) {
    const density = (d === 'draft' || d === 'epic') ? d : 'studio';
    state.storyDensity = density;
    $$('#story-density .chip').forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-density') === density);
    });
    const hint = $('#story-density-hint');
    if (hint) hint.textContent = DENSITY_HINTS[density] || DENSITY_HINTS.studio;
  }

  function syncDensityFromStory(story) {
    const d = (story && story.density) || (story && story.outline && story.outline.density) || state.storyDensity || 'studio';
    setStoryDensity(d);
  }

  function swatchHtml(colors) {
    if (!colors || !colors.length) return '';
    return `<div class="swatches">${colors.map((c) => `<span class="swatch" style="background:${escapeHtml(c)}" title="${escapeHtml(c)}"></span>`).join('')}</div>`;
  }

  function beatBadge(beat) {
    const b = String(beat || 'setup');
    return `<span class="beat-pill beat-${escapeHtml(b)}">${escapeHtml(b)}</span>`;
  }

  function shotBadge(shot) {
    const s = String(shot || 'medium');
    return `<span class="shot-pill">${escapeHtml(s)}</span>`;
  }

  async function openStoryChat(existingId) {
    haptic(10);
    if (existingId) {
      const story = await DialogueDB.getStory(existingId);
      if (!story) return;
      state.currentStoryId = story.id;
      showScreen('story-chat');
      syncDensityFromStory(story);
      renderStoryChat(story);
      return;
    }
    const story = DialogueDB.emptyStory({ title: 'Untitled Story', status: 'draft', density: state.storyDensity || 'studio' });
    await DialogueDB.saveStory(story);
    state.currentStoryId = story.id;
    showScreen('story-chat');
    syncDensityFromStory(story);
    renderStoryChat(story);
  }

  async function resumeStory(id) {
    const story = await DialogueDB.getStory(id);
    if (!story) return;
    state.currentStoryId = id;
    syncDensityFromStory(story);
    if (story.status === 'pages' || story.status === 'ready') {
      showScreen('story-pages');
      renderStoryPages(story);
      return;
    }
    if (story.status === 'bible' && story.bible) {
      showScreen('story-bible');
      renderStoryBible(story);
      return;
    }
    showScreen('story-chat');
    renderStoryChat(story);
  }

  function renderStoryChat(story) {
    const title = $('#story-chat-title');
    if (title) title.textContent = (story.outline && story.outline.title) || story.title || 'New story';
    const intro = $('#story-intro');
    const messagesEl = $('#story-messages');
    const outlineCard = $('#story-outline-card');
    const composer = $('#story-composer');
    const approve = $('#story-approve');
    const densifyBtn = $('#story-densify');
    const hasOutline = !!(story.outline && story.outline.chapters && story.outline.chapters.length);
    syncDensityFromStory(story);
    if (intro) intro.hidden = hasOutline;
    if (composer) composer.hidden = !hasOutline;
    if (approve) approve.disabled = !hasOutline || state.storyBusy;
    if (densifyBtn) densifyBtn.disabled = !hasOutline || state.storyBusy;
    if (!hasOutline) {
      if ($('#story-plot')) $('#story-plot').value = story.plot || '';
      if ($('#story-tone')) $('#story-tone').value = story.tone || '';
      if (messagesEl) { messagesEl.hidden = true; messagesEl.innerHTML = ''; }
      if (outlineCard) { outlineCard.hidden = true; outlineCard.innerHTML = ''; }
      return;
    }
    if (messagesEl) {
      messagesEl.hidden = false;
      messagesEl.innerHTML = (story.messages || []).map((m) => {
        const role = m.role === 'user' ? 'user' : (m.role === 'error' ? 'error' : 'assistant');
        return `<div class="story-bubble ${role}">${escapeHtml(m.content || '')}</div>`;
      }).join('');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    if (outlineCard) {
      outlineCard.hidden = false;
      outlineCard.innerHTML = outlineHtml(story.outline);
    }
    const scroll = $('#story-chat-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function outlineHtml(outline) {
    if (!outline) return '';
    const chapters = outline.chapters || [];
    const density = outline.density || state.storyDensity || 'studio';
    const chHtml = chapters.map((ch, i) => {
      const scenes = (ch.scenes || []).map((sc) => {
        const meta = [
          sc.beat ? beatBadge(sc.beat) : '',
          sc.conflict ? `<span class="beat-meta"><strong>Conflict</strong> ${escapeHtml(sc.conflict)}</span>` : '',
          sc.emotion ? `<span class="beat-meta"><strong>Emotion</strong> ${escapeHtml(sc.emotion)}</span>` : '',
        ].filter(Boolean).join(' ');
        return `<li class="beat-li"><div class="beat-sum">${escapeHtml(sc.summary || sc.id)}</div>${meta ? `<div class="beat-row">${meta}</div>` : ''}</li>`;
      }).join('');
      const arc = ch.arcRole ? `<span class="arc-pill">${escapeHtml(ch.arcRole)}</span>` : '';
      return `<div class="story-chapter"><h3>${i + 1}. ${escapeHtml(ch.title || 'Chapter')} ${arc}</h3><p>${escapeHtml(ch.summary || '')}</p>${scenes ? `<ul class="beat-list">${scenes}</ul>` : ''}</div>`;
    }).join('');
    return `<h2>${escapeHtml(outline.title || 'Untitled')}</h2>
      <p class="logline">${escapeHtml(outline.logline || '')}</p>
      <div class="meta-row"><span class="density-pill">${escapeHtml(density)}</span><span>${chapters.length} chapters</span><span>~${escapeHtml(String(outline.suggestedPages || '?'))} pages</span></div>
      ${chHtml}
      ${outline.rationale ? `<p class="logline">${escapeHtml(outline.rationale)}</p>` : ''}`;
  }

  async function getCurrentStory() {
    if (!state.currentStoryId) return null;
    return DialogueDB.getStory(state.currentStoryId);
  }

  function setStoryBusy(busy) {
    state.storyBusy = !!busy;
    ['story-expand', 'story-chat-send', 'story-densify', 'story-approve', 'story-gen-pages', 'story-enrich-cast'].forEach((id) => {
      const el = $('#' + id);
      if (!el) return;
      if (busy) {
        el.disabled = true;
        return;
      }
      // Callers re-enable approve / gen-pages / densify when content is ready.
      if (id === 'story-expand' || id === 'story-chat-send') el.disabled = false;
    });
  }

  async function expandStory() {
    if (state.storyBusy) return;
    const plot = ($('#story-plot') && $('#story-plot').value || '').trim();
    const tone = ($('#story-tone') && $('#story-tone').value || '').trim();
    if (!plot) {
      toast('Enter a plot first');
      return;
    }
    const story = await getCurrentStory();
    if (!story) return;
    setStoryBusy(true);
    story.plot = plot;
    story.tone = tone;
    story.messages = (story.messages || []).concat([{ role: 'user', content: plot }]);
    await DialogueDB.saveStory(story);
    renderStoryChat(Object.assign({}, story, { outline: story.outline }));
    // show composer area with pending state via messages
    const intro = $('#story-intro');
    if (intro) intro.hidden = true;
    const messagesEl = $('#story-messages');
    if (messagesEl) {
      messagesEl.hidden = false;
      messagesEl.innerHTML = `<div class="story-bubble user">${escapeHtml(plot)}</div><div class="story-bubble assistant">Expanding outline…</div>`;
    }
    try {
      const density = state.storyDensity || 'studio';
      story.density = density;
      const res = await DialogueStory.expand(plot, tone, density);
      story.outline = res.outline;
      story.beatGraph = res.outline;
      story.density = (res.outline && res.outline.density) || density;
      story.title = (res.outline && res.outline.title) || story.title;
      story.messages.push({ role: 'assistant', content: res.message || 'Outline ready.' });
      story.status = 'draft';
      await DialogueDB.saveStory(story);
      const composer = $('#story-composer');
      if (composer) composer.hidden = false;
      renderStoryChat(story);
      haptic(10);
    } catch (err) {
      const msg = (err && err.message) || 'Expand failed';
      story.messages.push({ role: 'error', content: msg });
      await DialogueDB.saveStory(story);
      if (messagesEl) {
        messagesEl.innerHTML += `<div class="story-bubble error">${escapeHtml(msg)}</div>`;
      }
      if (intro) intro.hidden = false;
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
      const ready = !!(story.outline && story.outline.chapters && story.outline.chapters.length);
      const approve = $('#story-approve');
      const densifyBtn = $('#story-densify');
      if (approve) approve.disabled = !ready;
      if (densifyBtn) densifyBtn.disabled = !ready;
    }
  }

  async function sendStoryChat() {
    if (state.storyBusy) return;
    const input = $('#story-chat-input');
    const text = (input && input.value || '').trim();
    if (!text) return;
    const story = await getCurrentStory();
    if (!story || !story.outline) return;
    if (input) input.value = '';
    setStoryBusy(true);
    story.messages = (story.messages || []).concat([{ role: 'user', content: text }]);
    await DialogueDB.saveStory(story);
    renderStoryChat(story);
    const messagesEl = $('#story-messages');
    if (messagesEl) messagesEl.innerHTML += `<div class="story-bubble assistant">Updating…</div>`;
    try {
      const res = await DialogueStory.chat(story.messages, story.outline, story.density || state.storyDensity);
      story.outline = res.outline;
      story.beatGraph = res.outline;
      story.density = (res.outline && res.outline.density) || story.density;
      story.title = (res.outline && res.outline.title) || story.title;
      story.messages.push({ role: 'assistant', content: res.message || 'Updated.' });
      await DialogueDB.saveStory(story);
      renderStoryChat(story);
      haptic(10);
    } catch (err) {
      const msg = (err && err.message) || 'Chat failed';
      story.messages.push({ role: 'error', content: msg });
      await DialogueDB.saveStory(story);
      renderStoryChat(story);
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
      const ready = !!(story.outline && story.outline.chapters && story.outline.chapters.length);
      const approve = $('#story-approve');
      const densifyBtn = $('#story-densify');
      if (approve) approve.disabled = !ready;
      if (densifyBtn) densifyBtn.disabled = !ready;
    }
  }

  async function densifyStory() {
    if (state.storyBusy) return;
    const story = await getCurrentStory();
    if (!story || !story.outline) return;
    setStoryBusy(true);
    const messagesEl = $('#story-messages');
    if (messagesEl) messagesEl.innerHTML += `<div class="story-bubble assistant">Densifying beat graph…</div>`;
    try {
      const density = story.density || state.storyDensity || 'studio';
      const res = await DialogueStory.densify(story.outline, density, story.plot);
      story.outline = res.outline;
      story.beatGraph = res.outline;
      story.density = (res.outline && res.outline.density) || density;
      story.messages = (story.messages || []).concat([{ role: 'assistant', content: res.message || 'Densified.' }]);
      await DialogueDB.saveStory(story);
      renderStoryChat(story);
      haptic(10);
      toast('Densified');
    } catch (err) {
      const msg = (err && err.message) || 'Densify failed';
      story.messages = (story.messages || []).concat([{ role: 'error', content: msg }]);
      await DialogueDB.saveStory(story);
      renderStoryChat(story);
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
      const approve = $('#story-approve');
      const densifyBtn = $('#story-densify');
      const ready = !!(story.outline && story.outline.chapters && story.outline.chapters.length);
      if (approve) approve.disabled = !ready;
      if (densifyBtn) densifyBtn.disabled = !ready;
    }
  }

  async function approveOutline() {
    if (state.storyBusy) return;
    const story = await getCurrentStory();
    if (!story || !story.outline) return;
    setStoryBusy(true);
    showScreen('story-bible');
    const busy = $('#story-bible-busy');
    const body = $('#story-bible-body');
    const genBtn = $('#story-gen-pages');
    const enrichBtn = $('#story-enrich-cast');
    if (busy) { busy.hidden = false; busy.textContent = 'Building bible…'; }
    if (body) { body.hidden = true; body.innerHTML = ''; }
    if (genBtn) genBtn.disabled = true;
    if (enrichBtn) enrichBtn.hidden = true;
    try {
      const density = story.density || state.storyDensity || 'studio';
      const res = await DialogueStory.bible(story.outline, density);
      story.bible = res.bible;
      story.status = 'bible';
      // Client-side enrich once if cast still thin (server also auto-enriches)
      if (DialogueStory.bibleNeedsEnrich(story.bible, density)) {
        if (busy) busy.textContent = 'Expanding cast…';
        try {
          const enriched = await DialogueStory.enrichBible(story.bible, story.outline, density);
          if (enriched && enriched.bible) story.bible = enriched.bible;
        } catch (enrichErr) {
          console.warn('enrich_bible failed', enrichErr);
        }
      }
      await DialogueDB.saveStory(story);
      renderStoryBible(story);
      haptic(10);
    } catch (err) {
      const msg = (err && err.message) || 'Bible failed';
      if (busy) busy.textContent = msg;
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
    }
  }

  async function enrichStoryCast() {
    if (state.storyBusy) return;
    const story = await getCurrentStory();
    if (!story || !story.outline || !story.bible) return;
    setStoryBusy(true);
    const busy = $('#story-bible-busy');
    const body = $('#story-bible-body');
    if (busy) { busy.hidden = false; busy.textContent = 'Expanding cast…'; }
    if (body) body.hidden = true;
    try {
      const density = story.density || state.storyDensity || 'studio';
      const res = await DialogueStory.enrichBible(story.bible, story.outline, density);
      story.bible = res.bible;
      story.status = 'bible';
      await DialogueDB.saveStory(story);
      renderStoryBible(story);
      haptic(10);
      toast('Cast enriched');
    } catch (err) {
      const msg = (err && err.message) || 'Enrich failed';
      if (busy) { busy.hidden = false; busy.textContent = msg; }
      if (body) body.hidden = false;
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
    }
  }

  function renderStoryBible(story) {
    const busy = $('#story-bible-busy');
    const body = $('#story-bible-body');
    const genBtn = $('#story-gen-pages');
    const enrichBtn = $('#story-enrich-cast');
    const bible = story.bible;
    if (!bible) {
      if (busy) { busy.hidden = false; busy.textContent = 'No bible yet.'; }
      if (body) body.hidden = true;
      if (genBtn) genBtn.disabled = true;
      if (enrichBtn) enrichBtn.hidden = true;
      return;
    }
    if (busy) busy.hidden = true;
    const density = story.density || state.storyDensity || 'studio';
    const charCount = (bible.characters || []).length;
    const locCount = (bible.locations || []).length;
    const minChars = DialogueStory.bibleMinChars(density);
    const needsEnrich = charCount < minChars;
    if (enrichBtn) {
      enrichBtn.hidden = false;
      enrichBtn.disabled = !!state.storyBusy;
      enrichBtn.textContent = needsEnrich ? 'Enrich cast' : 'Enrich cast';
    }
    if (body) {
      body.hidden = false;
      const vs = bible.visualStyle;
      const vsText = (vs && typeof vs === 'object')
        ? [vs.medium, vs.line, vs.lighting, vs.palette, vs.cameraGrammar].filter(Boolean).join(' · ')
        : (bible.visualStyleFlat || vs || '');
      const castBadge = `<span class="cast-badge${needsEnrich ? ' cast-thin' : ''}" title="Minimum ${minChars} for ${density}">${charCount} cast · ${locCount} locs</span>`;
      const chars = (bible.characters || []).map((c, idx) => {
        const dna = c.visualDNA || {};
        const colors = dna.colorHex || [];
        const wardrobe = (dna.wardrobeLocked || []).join(', ');
        const psych = c.psychology || {};
        const detailId = 'char-detail-' + idx;
        const dnaLine = [dna.face, dna.hair, dna.body, dna.skin, dna.distinctiveMarks].filter(Boolean).join('; ');
        return `<div class="story-char-card">
          <div class="char-card-head">
            <div>
              <div class="name">${escapeHtml(c.name || '')} <span class="id">${escapeHtml(c.id || '')}</span></div>
              <div class="role-line">${escapeHtml(c.role || '')}${c.ageRange ? ' · ' + escapeHtml(c.ageRange) : ''}</div>
            </div>
            ${swatchHtml(colors)}
          </div>
          <p class="dna-summary">${escapeHtml(dnaLine || c.appearance || '')}</p>
          ${wardrobe ? `<p class="wardrobe"><strong>Wardrobe lock</strong> ${escapeHtml(wardrobe)}</p>` : ''}
          <button type="button" class="btn-ghost char-expand" data-expand="${detailId}">Expand detail</button>
          <div class="char-detail" id="${detailId}" hidden>
            <p><strong>Want</strong> ${escapeHtml(psych.want || '—')} · <strong>Need</strong> ${escapeHtml(psych.need || '—')}</p>
            <p><strong>Wound</strong> ${escapeHtml(psych.wound || '—')} · <strong>Lie</strong> ${escapeHtml(psych.lie || '—')}</p>
            <p><strong>Fear</strong> ${escapeHtml(psych.fear || '—')}</p>
            <p><strong>Voice</strong> ${escapeHtml((c.voice && c.voice.diction) || c.personality || '—')}</p>
            <p><strong>Arc</strong> ${escapeHtml(c.arc || '—')}</p>
          </div>
        </div>`;
      }).join('');
      const locs = (bible.locations || []).map((l) => `
        <div class="story-loc-card">
          <div class="name">${escapeHtml(l.name || '')} <span class="id">${escapeHtml(l.id || '')}</span></div>
          ${swatchHtml(l.palette || [])}
          <p>${escapeHtml(l.sensory || l.description || '')}</p>
          ${(l.recurringMotifs || []).length ? `<p class="motifs">${(l.recurringMotifs || []).map((m) => escapeHtml(m)).join(' · ')}</p>` : ''}
        </div>`).join('');
      const rules = (bible.rules || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('');
      const motifs = (bible.motifs || []).map((m) => `<span class="motif-chip">${escapeHtml(m)}</span>`).join('');
      body.innerHTML = `
        <div class="story-bible-meta">${castBadge}${needsEnrich ? '<span class="cast-hint">Cast thin — enrich recommended</span>' : ''}</div>
        <div class="story-bible-block"><h2><span data-icon="book" class="ico"></span> Visual style</h2>
          <p>${escapeHtml(vsText)}</p>
          <p class="logline">${escapeHtml(bible.toneNotes || '')}${bible.maturity ? ' · ' + escapeHtml(bible.maturity) : ''}</p>
        </div>
        <div class="story-bible-block"><h2>Characters ${castBadge}</h2><div class="char-grid">${chars || '<p class="logline">None</p>'}</div></div>
        <div class="story-bible-block"><h2>Locations</h2><div class="loc-grid">${locs || '<p class="logline">None</p>'}</div></div>
        ${rules ? `<div class="story-bible-block"><h2>World rules</h2><ul class="rules-list">${rules}</ul></div>` : ''}
        ${motifs ? `<div class="story-bible-block"><h2>Motifs</h2><div class="motif-row">${motifs}</div></div>` : ''}`;
      hydrateIcons(body);
      body.querySelectorAll('[data-expand]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const el = document.getElementById(btn.getAttribute('data-expand'));
          if (!el) return;
          el.hidden = !el.hidden;
          btn.textContent = el.hidden ? 'Expand detail' : 'Hide detail';
        });
      });
    }
    if (genBtn) genBtn.disabled = false;
  }

  async function generateStoryPages() {
    if (state.storyBusy) return;
    const story = await getCurrentStory();
    if (!story || !story.outline || !story.bible) return;
    setStoryBusy(true);
    showScreen('story-pages');
    const busy = $('#story-pages-busy');
    const body = $('#story-pages-body');
    const title = $('#story-pages-title');
    if (title) title.textContent = story.title || 'Pages';
    if (busy) { busy.hidden = false; busy.textContent = 'Generating panels…'; }
    if (body) { body.hidden = true; body.innerHTML = ''; }
    try {
      const density = story.density || state.storyDensity || 'studio';
      if (busy) busy.textContent = density === 'draft' ? 'Generating panels…' : `Generating ${density} panels by chapter…`;
      const res = await DialogueStory.pagesForStory(story.outline, story.bible, density);
      story.pages = res.pages || [];
      story.status = 'ready';
      await DialogueDB.saveStory(story);
      renderStoryPages(story);
      haptic(10);
    } catch (err) {
      const msg = (err && err.message) || 'Pages failed';
      if (busy) busy.textContent = msg;
      toast(msg.slice(0, 80));
    } finally {
      setStoryBusy(false);
    }
  }

  function renderStoryPages(story) {
    const busy = $('#story-pages-busy');
    const body = $('#story-pages-body');
    const title = $('#story-pages-title');
    if (title) title.textContent = story.title || 'Pages';
    const pages = story.pages || [];
    if (!pages.length) {
      if (busy) { busy.hidden = false; busy.textContent = 'No pages yet.'; }
      if (body) body.hidden = true;
      return;
    }
    if (busy) busy.hidden = true;
    if (!body) return;
    body.hidden = false;
    const charMap = DialogueStory.charLookup(story.bible);
    const assetMap = {};
    (story.assets || []).forEach((a) => { assetMap[a.id] = a; });
    const missing = pages.reduce((n, pg) => n + ((pg.panels || []).filter((p) => !p.artAssetId).length || 0), 0);
    const queueCta = `<div class="story-pages-actions">
      <button type="button" class="btn-secondary" id="story-pages-art-queue">${iconHtml('queue')} Art Queue${missing ? ` · ${missing} left` : ' · done'}</button>
    </div>`;
    body.innerHTML = queueCta + pages.map((pg) => {
      const panels = (pg.panels || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      const panelsHtml = panels.map((pan, idx) => {
        const lines = (pan.dialogue || []).map((d) => {
          const who = d.speakerId && charMap[d.speakerId] ? charMap[d.speakerId].name : '';
          const cls = d.balloon === 'caption' ? 'caption' : '';
          return `<div class="story-balloon-line ${cls}">${who ? `<span class="who">${escapeHtml(who)}</span>` : ''}${escapeHtml(d.text || '')}</div>`;
        }).join('');
        const sub = pan.subtext ? `<p class="panel-subtext">${escapeHtml(pan.subtext)}</p>` : '';
        const act = pan.action ? `<p class="panel-action">${escapeHtml(pan.action)}</p>` : '';
        return `<div class="story-panel" data-page-id="${escapeHtml(pg.id)}" data-panel-id="${escapeHtml(pan.id || String(idx))}">
          <div class="slug">${shotBadge(pan.shot)} ${escapeHtml(pan.scene || ('Panel ' + (idx + 1)))}</div>
          ${pan.artAssetId && assetMap[pan.artAssetId] && assetMap[pan.artAssetId].dataURL
            ? `<div class="art-ph has-art"><img alt="" src="${assetMap[pan.artAssetId].dataURL}"/></div>`
            : `<div class="art-ph">Forge prompt ready</div>`}
          ${act}${sub}
          ${lines}
          <div class="story-panel-actions">
            <button type="button" data-copy-prompt="${escapeHtml(pg.id)}::${escapeHtml(pan.id || String(idx))}">${iconHtml('copy')} Copy prompt</button>
          </div>
        </div>`;
      }).join('');
      return `<article class="story-page-card" data-page-id="${escapeHtml(pg.id)}">
        <div class="page-head"><h2>${escapeHtml(pg.title || pg.id)}</h2><span class="kind-pill">${escapeHtml(pg.kind || 'story')}</span></div>
        ${panelsHtml}
        <div class="page-actions-row">
          <button type="button" class="btn-secondary" data-copy-all="${escapeHtml(pg.id)}">${iconHtml('copy')} Copy all prompts</button>
          <button type="button" class="open-editor-btn" data-open-page="${escapeHtml(pg.id)}">Open in editor</button>
        </div>
      </article>`;
    }).join('');

    body.querySelectorAll('[data-copy-prompt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-copy-prompt') || '';
        const [pageId, panelId] = key.split('::');
        const page = pages.find((p) => p.id === pageId);
        const pan = page && (page.panels || []).find((x) => String(x.id) === String(panelId));
        if (pan && pan.imagePrompt) copyPrompt(pan.imagePrompt);
        else toast('No prompt on this panel');
      });
    });
    body.querySelectorAll('[data-copy-all]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-copy-all');
        const page = pages.find((p) => p.id === pageId);
        const prompts = ((page && page.panels) || []).map((p, i) => `--- Panel ${i + 1} (${p.shot || 'medium'}) ---\n${p.imagePrompt || ''}`).filter((t) => t.includes('---'));
        if (!prompts.length) { toast('No prompts on this page'); return; }
        copyPrompt(prompts.join('\n\n'));
      });
    });
    body.querySelectorAll('[data-open-page]').forEach((btn) => {
      btn.addEventListener('click', () => openStoryPageInEditor(story.id, btn.getAttribute('data-open-page')));
    });
    const aqBtn = body.querySelector('#story-pages-art-queue');
    if (aqBtn) aqBtn.addEventListener('click', () => openArtQueueFromStory(story.id));
  }


  async function syncStoryArtIntoBundle(story, storyPage, bundle) {
    if (!story || !storyPage || !bundle) return;
    const storyAssets = story.assets || [];
    const panels = (bundle.panels || []).slice().sort((a, b) => a.order - b.order);
    const specs = (storyPage.panels || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    let changed = false;
    if (!bundle.assets) bundle.assets = [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      if (!spec.artAssetId) continue;
      let panel =
        panels.find((p) => p.storyPanelId && String(p.storyPanelId) === String(spec.id)) ||
        panels[i];
      if (!panel) continue;
      if (panel.artAssetId === spec.artAssetId) continue;
      const src = storyAssets.find((a) => a.id === spec.artAssetId);
      if (!src || !src.dataURL) continue;
      if (!bundle.assets.find((a) => a.id === src.id)) {
        bundle.assets.push({
          id: src.id,
          projectId: bundle.project.id,
          mime: src.mime || 'image/png',
          name: src.name || 'mage-art.png',
          dataURL: src.dataURL,
          createdAt: src.createdAt || DialogueUtils.now(),
        });
      }
      panel.artAssetId = src.id;
      panel.fit = panel.fit || 'cover';
      changed = true;
    }
    if (changed) {
      if (!bundle.project.coverAssetId && bundle.assets[0]) {
        bundle.project.coverAssetId = bundle.assets[0].id;
      }
      await DialogueDB.saveProjectBundle(bundle);
    }
  }

  async function openStoryPageInEditor(storyId, pageId) {
    const story = await DialogueDB.getStory(storyId);
    if (!story) return;
    const storyPage = (story.pages || []).find((p) => p.id === pageId);
    if (!storyPage) return;
    haptic(10);
    let projectId = story.projectLinks && story.projectLinks[pageId];
    if (projectId) {
      const existing = await DialogueDB.getProjectBundle(projectId);
      if (existing) {
        await syncStoryArtIntoBundle(story, storyPage, existing);
        await openEditor(projectId);
        return;
      }
    }
    const bundle = DialogueStory.buildProjectFromStoryPage(story, storyPage);
    await DialogueDB.saveProjectBundle(bundle);
    if (!story.projectLinks) story.projectLinks = {};
    story.projectLinks[pageId] = bundle.project.id;
    await DialogueDB.saveStory(story);
    await openEditor(bundle.project.id);
  }

  
  function initArtQueue() {
    if (!window.DialogueArtQueue) return;
    DialogueArtQueue.init({
      toast,
      copyPrompt,
      iconHtml,
      escapeHtml,
      haptic,
      getEditor: () => state.editor,
      getEditorBundle: () => (state.editor ? state.editor.getBundle() : null),
      onStoryUpdated: async (storyId) => {
        if (state.currentStoryId === storyId || !storyId) {
          const story = await DialogueDB.getStory(storyId || state.currentStoryId);
          if (story && state.route === 'story-pages') renderStoryPages(story);
        }
      },
      onProjectUpdated: async () => {
        if (state.editor) {
          state.editor.flushAutosave();
          renderFilmstrip();
        }
      },
      onClose: async (mode, storyId) => {
        if (mode === 'story' && storyId) {
          const story = await DialogueDB.getStory(storyId);
          if (story && state.route === 'story-pages') renderStoryPages(story);
        }
        if (mode === 'project' && state.editor) {
          renderFilmstrip();
          if (state.dockTool === 'art') renderTray();
        }
      },
    });
    hydrateIcons(document.getElementById('art-queue'));
  }

  async function openArtQueueFromStory(storyId) {
    const id = storyId || state.currentStoryId;
    if (!id) {
      toast('No story open');
      return;
    }
    if (!window.DialogueArtQueue) {
      toast('Art Queue unavailable');
      return;
    }
    await DialogueArtQueue.openFromStory(id);
  }

  async function openArtQueueFromEditor(opts) {
    if (!state.currentId) {
      toast('No comic open');
      return;
    }
    if (!window.DialogueArtQueue) {
      toast('Art Queue unavailable');
      return;
    }
    await DialogueArtQueue.openFromProject(state.currentId, opts || {});
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
      <div class="row"><label>Haptics</label><input type="checkbox" id="set-haptic" ${s.haptic!==false?'checked':''}/></div>
      <div class="row"><label>Export quality</label>
        <input type="range" id="set-quality" min="0.6" max="1" step="0.02" value="${s.exportQuality}"/></div>
      <div class="row"><button type="button" id="set-reset" class="btn-primary">Reset local data</button></div>
      <div class="row"><label>About</label><span>Dialogue — Comics from your pocket.</span></div>
      <p class="camera-note">Camera: Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>
    `;
    $('#set-theme').onchange = async (e) => { s.theme = e.target.value; await saveSettings(); };
    $('#set-format').onchange = async (e) => { s.defaultFormat = e.target.value; await saveSettings(); };
    $('#set-autosave').onchange = async (e) => { s.autosave = e.target.checked; await saveSettings(); };
    $('#set-motion').onchange = async (e) => { s.reduceMotion = e.target.checked; await saveSettings(); };
    $('#set-haptic').onchange = async (e) => { s.haptic = e.target.checked; await saveSettings(); };
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
