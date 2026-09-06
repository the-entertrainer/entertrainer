/**
 * Mage Art Queue — manual one-panel copy → Mage.space → paste image flow.
 * Mage ToS forbids automation; there is no public API. User generates off-app.
 */
(function (global) {
  const MAGE_URL = 'https://www.mage.space/';
  const U = () => global.DialogueUtils;

  const queue = {
    open: false,
    mode: null, // 'story' | 'project'
    storyId: null,
    projectId: null,
    items: [],
    index: 0,
    deps: null,
  };

  function esc(s) {
    if (queue.deps && queue.deps.escapeHtml) return queue.deps.escapeHtml(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function icon(name) {
    if (queue.deps && queue.deps.iconHtml) return queue.deps.iconHtml(name);
    return '';
  }

  function toast(msg) {
    if (queue.deps && queue.deps.toast) queue.deps.toast(msg);
  }

  function haptic(ms) {
    if (queue.deps && queue.deps.haptic) queue.deps.haptic(ms);
  }

  function rootEl() {
    return document.getElementById('art-queue');
  }

  function bodyEl() {
    return document.getElementById('art-queue-body');
  }

  function progressEl() {
    return document.getElementById('art-queue-progress');
  }

  function needsArt(panel) {
    if (!panel) return false;
    return !panel.artAssetId;
  }

  function dialoguePreviewFromStory(panel, charMap) {
    const lines = Array.isArray(panel.dialogue) ? panel.dialogue : [];
    return lines
      .map((d) => {
        const who =
          d.speakerId && charMap && charMap[d.speakerId]
            ? charMap[d.speakerId].name
            : '';
        const t = String(d.text || '').trim();
        return who ? who + ': ' + t : t;
      })
      .filter(Boolean)
      .slice(0, 3)
      .join(' · ');
  }

  function charNames(ids, charMap) {
    if (!ids || !ids.length) return [];
    return ids
      .map((id) => (charMap && charMap[id] ? charMap[id].name : id))
      .filter(Boolean);
  }

  function itemsFromStory(story) {
    const pages = (story.pages || []).slice();
    const charMap =
      global.DialogueStory && global.DialogueStory.charLookup
        ? global.DialogueStory.charLookup(story.bible)
        : {};
    const items = [];
    pages.forEach((pg, pi) => {
      const panels = (pg.panels || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      panels.forEach((pan, idx) => {
        if (!needsArt(pan)) return;
        const panelId = pan.id != null ? String(pan.id) : String(idx);
        items.push({
          key: pg.id + '::' + panelId,
          pageId: pg.id,
          panelId,
          storyPanelId: pan.id != null ? String(pan.id) : null,
          pageTitle: pg.title || pg.id || 'Page',
          pageOrder: pi,
          panelOrder: pan.order != null ? pan.order : idx,
          scene: pan.scene || '',
          shot: pan.shot || 'medium',
          characters: charNames(pan.characters || [], charMap),
          dialoguePreview: dialoguePreviewFromStory(pan, charMap),
          imagePrompt: pan.imagePrompt || '',
          action: pan.action || '',
          subtext: pan.subtext || '',
        });
      });
    });
    return items;
  }

  function itemsFromBundle(bundle, opts) {
    const pages = (bundle.pages || []).slice().sort((a, b) => a.order - b.order);
    const pageMap = {};
    pages.forEach((p, i) => {
      pageMap[p.id] = { page: p, order: i };
    });
    const panels = (bundle.panels || []).slice().sort((a, b) => {
      const pa = pageMap[a.pageId] ? pageMap[a.pageId].order : 0;
      const pb = pageMap[b.pageId] ? pageMap[b.pageId].order : 0;
      if (pa !== pb) return pa - pb;
      return (a.order || 0) - (b.order || 0);
    });
    const nodes = bundle.nodes || [];
    const focusId = opts && opts.focusPanelId;
    const forceInclude = opts && opts.forceInclude;
    const items = [];
    panels.forEach((p) => {
      const force = forceInclude && focusId && p.id === focusId;
      if (!force && !needsArt(p)) return;
      const pageMeta = pageMap[p.pageId];
      const pageNodes = nodes.filter(
        (n) =>
          n.panelId === p.id &&
          (n.type === 'balloon' || n.type === 'caption')
      );
      const dial = pageNodes
        .map((n) => String(n.text || '').trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' · ');
      const chars = Array.isArray(p.storyCharacters) ? p.storyCharacters : [];
      items.push({
        key: (p.pageId || '') + '::' + p.id,
        pageId: p.pageId,
        panelId: p.id,
        storyPanelId: p.storyPanelId != null ? String(p.storyPanelId) : null,
        pageTitle: (pageMeta && pageMeta.page && pageMeta.page.kind) || 'Page',
        pageOrder: pageMeta ? pageMeta.order : 0,
        panelOrder: p.order || 0,
        scene: p.scene || '',
        shot: p.shot || 'medium',
        characters: chars,
        dialoguePreview: dial,
        imagePrompt: p.imagePrompt || '',
        action: '',
        subtext: '',
      });
    });
    if (focusId) {
      const idx = items.findIndex((it) => it.panelId === focusId);
      if (idx > 0) {
        const hit = items.splice(idx, 1)[0];
        items.unshift(hit);
      }
    }
    return items;
  }

  function currentItem() {
    return queue.items[queue.index] || null;
  }

  function updateProgress() {
    const el = progressEl();
    if (!el) return;
    const total = queue.items.length;
    if (!total) {
      el.textContent = 'Done';
      return;
    }
    el.textContent = queue.index + 1 + ' / ' + total;
  }

  function renderDone() {
    const body = bodyEl();
    if (!body) return;
    body.innerHTML =
      '<div class="art-queue-done">' +
      '<div class="art-queue-done-mark" aria-hidden="true">' +
      icon('check') +
      '</div>' +
      '<h2>All panels have art</h2>' +
      '<p>Every panel in this queue has an image. You can close and keep editing.</p>' +
      '<button type="button" class="btn-primary large" id="art-queue-done-close">' +
      icon('close') +
      ' Close</button>' +
      '</div>';
    const btn = document.getElementById('art-queue-done-close');
    if (btn) btn.addEventListener('click', close);
    updateProgress();
    const actions = document.getElementById('art-queue-actions');
    if (actions) actions.hidden = true;
  }

  function renderFocus() {
    const item = currentItem();
    const body = bodyEl();
    const actions = document.getElementById('art-queue-actions');
    if (actions) actions.hidden = false;
    if (!item || !body) {
      renderDone();
      return;
    }
    updateProgress();
    const chars =
      item.characters && item.characters.length
        ? '<div class="aq-meta"><span class="aq-label">Characters</span><span>' +
          esc(item.characters.join(', ')) +
          '</span></div>'
        : '';
    const scene = item.scene
      ? '<div class="aq-meta"><span class="aq-label">Scene</span><span>' +
        esc(item.scene) +
        '</span></div>'
      : '';
    const shot =
      '<div class="aq-meta"><span class="aq-label">Shot</span><span class="shot-pill">' +
      esc(item.shot || 'medium') +
      '</span></div>';
    const dial = item.dialoguePreview
      ? '<div class="aq-meta"><span class="aq-label">Dialogue</span><span>' +
        esc(item.dialoguePreview) +
        '</span></div>'
      : '';
    const action = item.action
      ? '<div class="aq-meta"><span class="aq-label">Action</span><span>' +
        esc(item.action) +
        '</span></div>'
      : '';
    body.innerHTML =
      '<div class="aq-card">' +
      '<div class="aq-kicker">Page ' +
      esc(String(item.pageOrder + 1)) +
      ' · Panel ' +
      esc(String(item.panelOrder + 1)) +
      ' <span class="aq-page-title">' +
      esc(item.pageTitle) +
      '</span></div>' +
      scene +
      shot +
      chars +
      action +
      dial +
      '<div class="aq-prompt-block">' +
      '<div class="aq-label">Image prompt</div>' +
      '<textarea id="aq-prompt" class="aq-prompt" readonly rows="8" aria-label="Image prompt">' +
      esc(item.imagePrompt || '(No prompt on this panel)') +
      '</textarea></div>' +
      '<p class="aq-note">Copy the prompt, generate on Mage.space, then paste the image back here. Mage is manual by design (ToS — no automation).</p>' +
      '</div>';
  }

  function showOverlay() {
    const root = rootEl();
    if (!root) return;
    root.hidden = false;
    requestAnimationFrame(function () {
      root.classList.add('open');
    });
    queue.open = true;
    document.body.classList.add('art-queue-open');
  }

  function hideOverlay() {
    const root = rootEl();
    if (!root) return;
    root.classList.remove('open');
    queue.open = false;
    document.body.classList.remove('art-queue-open');
    setTimeout(function () {
      if (!queue.open) root.hidden = true;
    }, 220);
  }

  function liveBundle(projectId) {
    if (queue.deps && queue.deps.getEditorBundle) {
      const b = queue.deps.getEditorBundle();
      if (b && b.project && b.project.id === projectId) return b;
    }
    return null;
  }

  async function openFromStory(storyId) {
    const story = await global.DialogueDB.getStory(storyId);
    if (!story) {
      toast('Story not found');
      return;
    }
    queue.mode = 'story';
    queue.storyId = storyId;
    queue.projectId = null;
    queue.items = itemsFromStory(story);
    queue.index = 0;
    showOverlay();
    if (!queue.items.length) renderDone();
    else renderFocus();
    haptic(10);
  }

  async function openFromProject(projectId, opts) {
    opts = opts || {};
    let bundle = liveBundle(projectId);
    if (!bundle) bundle = await global.DialogueDB.getProjectBundle(projectId);
    if (!bundle) {
      toast('Project not found');
      return;
    }
    queue.mode = 'project';
    queue.projectId = projectId;
    queue.storyId = (bundle.project && bundle.project.storyId) || null;

    if (opts.requeue && opts.focusPanelId) {
      await clearPanelArt(opts.focusPanelId);
      bundle = liveBundle(projectId) || (await global.DialogueDB.getProjectBundle(projectId));
      queue.items = itemsFromBundle(bundle, {
        focusPanelId: opts.focusPanelId,
        forceInclude: true,
      });
    } else {
      queue.items = itemsFromBundle(bundle, {
        focusPanelId: opts.focusPanelId,
        forceInclude: false,
      });
    }

    queue.index = 0;
    if (opts.focusPanelId) {
      const idx = queue.items.findIndex(function (it) {
        return it.panelId === opts.focusPanelId;
      });
      if (idx >= 0) queue.index = idx;
    }
    showOverlay();
    if (!queue.items.length) renderDone();
    else renderFocus();
    haptic(10);
  }

  async function clearPanelArt(panelId) {
    const ed = queue.deps && queue.deps.getEditor ? queue.deps.getEditor() : null;
    if (ed && ed.getBundle() && ed.getBundle().project.id === queue.projectId) {
      ed.select('panel', panelId);
      ed.clearArt();
      if (queue.deps.onProjectUpdated) await queue.deps.onProjectUpdated();
      return;
    }
    const bundle = await global.DialogueDB.getProjectBundle(queue.projectId);
    if (!bundle) return;
    const p = (bundle.panels || []).find(function (x) {
      return x.id === panelId;
    });
    if (!p) return;
    p.artAssetId = null;
    await global.DialogueDB.saveProjectBundle(bundle);
  }

  function close() {
    hideOverlay();
    if (queue.deps && queue.deps.onClose) {
      queue.deps.onClose(queue.mode, queue.storyId, queue.projectId);
    }
  }

  async function copyCurrentPrompt() {
    const item = currentItem();
    if (!item) return;
    const text = item.imagePrompt || '';
    if (queue.deps && queue.deps.copyPrompt) {
      await queue.deps.copyPrompt(text);
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast('Prompt copied');
      } catch (_) {
        toast('Copy failed');
      }
    }
  }

  async function openMage() {
    await copyCurrentPrompt();
    try {
      global.open(MAGE_URL, '_blank');
    } catch (_) {
      toast('Could not open Mage');
    }
    haptic(10);
  }

  function advanceAfterAssign() {
    if (queue.index >= 0 && queue.index < queue.items.length) {
      queue.items.splice(queue.index, 1);
    }
    if (!queue.items.length) {
      renderDone();
      return;
    }
    if (queue.index >= queue.items.length) queue.index = queue.items.length - 1;
    renderFocus();
  }

  function skip() {
    if (!queue.items.length) return;
    if (queue.index >= queue.items.length - 1) {
      toast('Last panel in queue');
      return;
    }
    queue.index += 1;
    renderFocus();
    haptic(8);
  }

  function back() {
    if (queue.index <= 0) {
      toast('First panel');
      return;
    }
    queue.index -= 1;
    renderFocus();
    haptic(8);
  }

  async function assignImageToCurrent(file) {
    const item = currentItem();
    if (!item || !file) return;
    const dataURL = await U().blobToDataURL(file);
    const assetPartial = {
      id: U().uid('asset'),
      mime: file.type || 'image/png',
      name: file.name || 'mage-art.png',
      dataURL: dataURL,
    };
    if (queue.mode === 'story') {
      await assignToStory(item, assetPartial);
    } else {
      await assignToProject(item, assetPartial);
    }
    toast('Art assigned');
    haptic(10);
    advanceAfterAssign();
  }

  function countDoneOnStory(story) {
    return (story.pages || []).reduce(function (n, pg) {
      return n + ((pg.panels || []).filter(function (p) {
        return !!p.artAssetId;
      }).length || 0);
    }, 0);
  }

  async function assignToStory(item, assetPartial) {
    const story = await global.DialogueDB.getStory(queue.storyId);
    if (!story) throw new Error('Story missing');
    const page = (story.pages || []).find(function (p) {
      return p.id === item.pageId;
    });
    if (!page) throw new Error('Page missing');
    const pan = (page.panels || []).find(function (x) {
      return String(x.id) === String(item.panelId);
    });
    if (!pan) throw new Error('Panel missing');

    const linkedProjectId =
      story.projectLinks && story.projectLinks[item.pageId]
        ? story.projectLinks[item.pageId]
        : null;

    const asset = {
      id: assetPartial.id,
      projectId: linkedProjectId || story.id,
      mime: assetPartial.mime,
      name: assetPartial.name,
      dataURL: assetPartial.dataURL,
      createdAt: U().now(),
    };
    await global.DialogueDB.putAsset(asset);

    pan.artAssetId = asset.id;
    if (!story.assets) story.assets = [];
    const existing = story.assets.findIndex(function (a) {
      return a.id === asset.id;
    });
    const slim = {
      id: asset.id,
      projectId: asset.projectId,
      mime: asset.mime,
      name: asset.name,
      dataURL: asset.dataURL,
      createdAt: asset.createdAt,
    };
    if (existing >= 0) story.assets[existing] = slim;
    else story.assets.push(slim);

    if (!story.artQueue) story.artQueue = {};
    story.artQueue.doneCount = countDoneOnStory(story);
    story.artQueue.updatedAt = U().now();

    await global.DialogueDB.saveStory(story);

    if (linkedProjectId) {
      await syncAssetToProject(linkedProjectId, item, asset);
    }

    if (queue.deps && queue.deps.onStoryUpdated) {
      await queue.deps.onStoryUpdated(story.id);
    }
  }

  async function syncAssetToProject(projectId, item, asset) {
    const live = liveBundle(projectId);
    if (live) {
      const ed = queue.deps.getEditor();
      if (!live.assets) live.assets = [];
      if (!live.assets.find(function (a) {
        return a.id === asset.id;
      })) {
        live.assets.push(Object.assign({}, asset, { projectId: projectId }));
      }
      const panel = findProjectPanel(live, item);
      if (panel) {
        ed.select('panel', panel.id);
        ed.setPanelArt(
          Object.assign({}, asset, { projectId: projectId }),
          'cover'
        );
      } else {
        await global.DialogueDB.putAsset(
          Object.assign({}, asset, { projectId: projectId })
        );
      }
      if (queue.deps.onProjectUpdated) await queue.deps.onProjectUpdated();
      return;
    }

    const bundle = await global.DialogueDB.getProjectBundle(projectId);
    if (!bundle) return;
    if (!bundle.assets) bundle.assets = [];
    if (!bundle.assets.find(function (a) {
      return a.id === asset.id;
    })) {
      bundle.assets.push(Object.assign({}, asset, { projectId: projectId }));
    }
    const panel = findProjectPanel(bundle, item);
    if (panel) {
      panel.artAssetId = asset.id;
      panel.fit = panel.fit || 'cover';
    }
    if (!bundle.project.coverAssetId) bundle.project.coverAssetId = asset.id;
    await global.DialogueDB.saveProjectBundle(bundle);
  }

  function findProjectPanel(bundle, item) {
    const panels = bundle.panels || [];
    let panel =
      panels.find(function (p) {
        return (
          item.storyPanelId &&
          String(p.storyPanelId) === String(item.storyPanelId)
        );
      }) ||
      panels.find(function (p) {
        return p.id === item.panelId;
      });
    if (!panel && item.panelOrder != null) {
      const pageId =
        item.pageId && panels.some(function (p) {
          return p.pageId === item.pageId;
        })
          ? item.pageId
          : bundle.pages && bundle.pages[0] && bundle.pages[0].id;
      const pagePanels = panels
        .filter(function (p) {
          return p.pageId === pageId;
        })
        .sort(function (a, b) {
          return a.order - b.order;
        });
      panel = pagePanels[item.panelOrder];
    }
    return panel || null;
  }

  async function assignToProject(item, assetPartial) {
    const asset = {
      id: assetPartial.id,
      projectId: queue.projectId,
      mime: assetPartial.mime,
      name: assetPartial.name,
      dataURL: assetPartial.dataURL,
      createdAt: U().now(),
    };
    await global.DialogueDB.putAsset(asset);

    const ed = queue.deps && queue.deps.getEditor ? queue.deps.getEditor() : null;
    const live = liveBundle(queue.projectId);
    if (ed && live) {
      ed.select('panel', item.panelId);
      ed.setPanelArt(asset, 'cover');
      if (!live.project.artQueue) live.project.artQueue = {};
      live.project.artQueue.doneCount = (live.panels || []).filter(function (p) {
        return !!p.artAssetId;
      }).length;
      live.project.artQueue.updatedAt = U().now();
      if (queue.deps.onProjectUpdated) await queue.deps.onProjectUpdated();
    } else {
      const bundle = await global.DialogueDB.getProjectBundle(queue.projectId);
      if (!bundle) throw new Error('Project missing');
      if (!bundle.assets) bundle.assets = [];
      if (!bundle.assets.find(function (a) {
        return a.id === asset.id;
      })) {
        bundle.assets.push(asset);
      }
      const panel = (bundle.panels || []).find(function (p) {
        return p.id === item.panelId;
      });
      if (panel) {
        panel.artAssetId = asset.id;
        panel.fit = panel.fit || 'cover';
      }
      if (!bundle.project.coverAssetId) bundle.project.coverAssetId = asset.id;
      if (!bundle.project.artQueue) bundle.project.artQueue = {};
      bundle.project.artQueue.doneCount = (bundle.panels || []).filter(function (
        p
      ) {
        return !!p.artAssetId;
      }).length;
      bundle.project.artQueue.updatedAt = U().now();
      await global.DialogueDB.saveProjectBundle(bundle);
    }

    // Sync back to linked story panel if project came from a story page
    const bundleNow = liveBundle(queue.projectId) || (await global.DialogueDB.getProjectBundle(queue.projectId));
    const proj = bundleNow && bundleNow.project;
    if (proj && proj.storyId && proj.storyPageId) {
      const story = await global.DialogueDB.getStory(proj.storyId);
      if (story) {
        const page = (story.pages || []).find(function (p) {
          return p.id === proj.storyPageId;
        });
        if (page) {
          const pan =
            (page.panels || []).find(function (x) {
              return (
                item.storyPanelId &&
                String(x.id) === String(item.storyPanelId)
              );
            }) ||
            (page.panels || []).find(function (x) {
              return String(x.id) === String(item.panelId);
            }) ||
            (page.panels || [])[item.panelOrder];
          if (pan) {
            pan.artAssetId = asset.id;
            if (!story.assets) story.assets = [];
            if (!story.assets.find(function (a) {
              return a.id === asset.id;
            })) {
              story.assets.push(Object.assign({}, asset));
            }
            if (!story.artQueue) story.artQueue = {};
            story.artQueue.doneCount = countDoneOnStory(story);
            story.artQueue.updatedAt = U().now();
            await global.DialogueDB.saveStory(story);
          }
        }
      }
    }
  }

  function bindDom() {
    const root = rootEl();
    if (!root || root.dataset.bound === '1') return;
    root.dataset.bound = '1';
    const closeBtn = document.getElementById('art-queue-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    const copyBtn = document.getElementById('aq-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      copyCurrentPrompt();
    });
    const mageBtn = document.getElementById('aq-mage');
    if (mageBtn) mageBtn.addEventListener('click', function () {
      openMage();
    });
    const pasteBtn = document.getElementById('aq-paste');
    const fileInput = document.getElementById('art-queue-file');
    if (pasteBtn && fileInput) {
      pasteBtn.addEventListener('click', function () {
        fileInput.click();
      });
      fileInput.addEventListener('change', async function (e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        try {
          await assignImageToCurrent(file);
        } catch (err) {
          console.error(err);
          toast((err && err.message) || 'Upload failed');
        }
      });
    }
    const skipBtn = document.getElementById('aq-skip');
    if (skipBtn) skipBtn.addEventListener('click', skip);
    const backBtn = document.getElementById('aq-back');
    if (backBtn) backBtn.addEventListener('click', back);
  }

  function init(deps) {
    queue.deps = deps || {};
    bindDom();
  }

  global.DialogueArtQueue = {
    init: init,
    openFromStory: openFromStory,
    openFromProject: openFromProject,
    close: close,
    isOpen: function () {
      return queue.open;
    },
    MAGE_URL: MAGE_URL,
  };
})(typeof window !== 'undefined' ? window : globalThis);
