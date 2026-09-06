(function (global) {
  const U = () => global.DialogueUtils;

  function createEditor(host, hooks) {
    let stage, panelLayer, nodeLayer, uiLayer;
    let bundle = null;
    let selectedId = null;
    let selectedKind = null; // panel | node
    let scale = 1;
    let history = global.DialogueHistory.createHistory(50);
    let autosaveTimer = null;
    let dirty = false;
    let imageCache = new Map(); // assetId -> HTMLImageElement
    let stickerCache = new Map();
    let ready = false;
    let pendingBundle = null;
    let resizeObs = null;
    let panMode = false;
    let panning = false;
    let panLast = null;

    function waitForSize() {
      return new Promise((resolve) => {
        const trySize = () => {
          const w = host.clientWidth;
          const h = host.clientHeight;
          if (w > 8 && h > 8) {
            resolve({ w, h });
            return true;
          }
          return false;
        };
        if (trySize()) return;
        let frames = 0;
        const tick = () => {
          frames += 1;
          if (trySize()) return;
          if (frames < 90) requestAnimationFrame(tick);
          else resolve({ w: host.clientWidth || 390, h: host.clientHeight || 600 });
        };
        requestAnimationFrame(tick);
        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver(() => {
            if (trySize()) {
              try { ro.disconnect(); } catch (_) {}
            }
          });
          ro.observe(host);
        }
      });
    }

    async function init() {
      const { w, h } = await waitForSize();
      stage = new Konva.Stage({ container: host, width: w, height: h, draggable: false });
      panelLayer = new Konva.Layer({ name: 'panels' });
      nodeLayer = new Konva.Layer({ name: 'nodes' });
      uiLayer = new Konva.Layer({ name: 'ui' });
      stage.add(panelLayer);
      stage.add(nodeLayer);
      stage.add(uiLayer);
      setupGestures();
      setupBackgroundPan();
      window.addEventListener('resize', resize);
      if (typeof ResizeObserver !== 'undefined') {
        resizeObs = new ResizeObserver(() => resize());
        resizeObs.observe(host);
        const wrap = host.closest('.editor-wrap');
        if (wrap) resizeObs.observe(wrap);
      }
      ready = true;
      if (pendingBundle) {
        const b = pendingBundle;
        pendingBundle = null;
        loadBundle(b);
      }
    }

    function resize() {
      if (!stage || !host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w < 4 || h < 4) return;
      stage.width(w);
      stage.height(h);
      fitView();
      stage.batchDraw();
    }

    function setupGestures() {
      let lastDist = 0;
      let lastCenter = null;
      stage.on('touchmove', (e) => {
        const touches = e.evt.touches;
        if (touches.length === 2) {
          e.evt.preventDefault();
          panning = false;
          panLast = null;
          const a = touches[0], b = touches[1];
          const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          const center = { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
          if (lastDist) {
            const rect = host.getBoundingClientRect();
            const local = { x: center.x - rect.left, y: center.y - rect.top };
            const oldScale = scale;
            scale = U().clamp(oldScale * (dist / lastDist), 0.3, 4);
            const mousePointTo = {
              x: (local.x - stage.x()) / oldScale,
              y: (local.y - stage.y()) / oldScale,
            };
            stage.scale({ x: scale, y: scale });
            stage.position({
              x: local.x - mousePointTo.x * scale,
              y: local.y - mousePointTo.y * scale,
            });
            if (lastCenter) {
              stage.position({
                x: stage.x() + (center.x - lastCenter.x),
                y: stage.y() + (center.y - lastCenter.y),
              });
            }
          }
          lastDist = dist;
          lastCenter = center;
        }
      });
      stage.on('touchend', () => { lastDist = 0; lastCenter = null; });
      stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const oldScale = scale;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const dir = e.evt.deltaY > 0 ? -1 : 1;
        scale = U().clamp(oldScale * (1 + dir * 0.08), 0.3, 4);
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };
        stage.scale({ x: scale, y: scale });
        stage.position({
          x: pointer.x - mousePointTo.x * scale,
          y: pointer.y - mousePointTo.y * scale,
        });
      });
    }

    function setupBackgroundPan() {
      const isBackgroundTarget = (target) => {
        if (!target || target === stage) return true;
        const name = target.name && target.name();
        if (name === 'page-bg' || name === 'empty-hit') return true;
        // Konva stage content root
        if (target.getType && target.getType() === 'Stage') return true;
        return false;
      };

      stage.on('mousedown touchstart', (e) => {
        if (e.evt.touches && e.evt.touches.length > 1) return;
        const target = e.target;
        // Don't pan when dragging a node/art
        if (target && target.getParent && target.name) {
          const n = target.name();
          if (n === 'art' || n === 'tail-tip' || n === 'sticker' || n === 'balloon') return;
          const parent = target.getParent();
          if (parent && (parent.name() === 'balloon' || parent.name() === 'sticker' || parent.name() === 'panel')) {
            // panel tap is selection — allow pan only on empty page bg
            if (parent.name() === 'panel' && !isBackgroundTarget(target)) return;
            if (parent.name() !== 'panel') return;
          }
        }
        if (!isBackgroundTarget(target) && selectedKind) {
          // tapping empty space while something selected → deselect + allow pan start
          if (target === stage || (target && target.name && target.name() === 'page-bg')) {
            clearSelectionChrome();
            selectedId = null;
            selectedKind = null;
            if (hooks && hooks.onSelect) hooks.onSelect(null, null);
          } else {
            return;
          }
        }
        // One-finger pan when nothing selected or on page background
        if (selectedKind && selectedKind !== null && !isBackgroundTarget(target)) return;
        panning = true;
        const pos = stage.getPointerPosition();
        panLast = pos ? { x: pos.x, y: pos.y } : null;
        if (!panLast && e.evt.touches && e.evt.touches[0]) {
          const rect = host.getBoundingClientRect();
          panLast = { x: e.evt.touches[0].clientX - rect.left, y: e.evt.touches[0].clientY - rect.top };
        }
      });

      stage.on('mousemove touchmove', (e) => {
        if (!panning || !panLast) return;
        if (e.evt.touches && e.evt.touches.length > 1) {
          panning = false;
          panLast = null;
          return;
        }
        let pos = stage.getPointerPosition();
        if (!pos && e.evt.touches && e.evt.touches[0]) {
          const rect = host.getBoundingClientRect();
          pos = { x: e.evt.touches[0].clientX - rect.left, y: e.evt.touches[0].clientY - rect.top };
        }
        if (!pos) return;
        const dx = pos.x - panLast.x;
        const dy = pos.y - panLast.y;
        stage.position({ x: stage.x() + dx, y: stage.y() + dy });
        panLast = pos;
        stage.batchDraw();
      });

      stage.on('mouseup touchend mouseleave', () => {
        panning = false;
        panLast = null;
      });
    }

    function fitView() {
      if (!bundle || !stage) return;
      const w = bundle.project.width || 800;
      const h = Math.max(bundle.project.height || 1200, 400);
      const pad = 20;
      const sx = (stage.width() - pad * 2) / w;
      const sy = (stage.height() - pad * 2) / Math.min(h, stage.height() / 0.35);
      scale = U().clamp(Math.min(sx, Math.max(sy, sx * 0.85)), 0.15, 2.5);
      // Prefer fitting width for webtoon strip
      scale = U().clamp((stage.width() - pad * 2) / w, 0.15, 2.5);
      stage.scale({ x: scale, y: scale });
      stage.position({
        x: (stage.width() - w * scale) / 2,
        y: pad,
      });
    }

    function loadBundle(b, opts) {
      if (!ready) {
        pendingBundle = b;
        return;
      }
      bundle = U().deepClone(b);
      if (!opts || !opts.skipHistory) history.seed(exportState());
      redraw(true);
      fitView();
      dirty = false;
    }

    function exportState() {
      return U().deepClone(bundle);
    }

    function getBundle() { return bundle; }

    function markDirty(coalesceKey) {
      dirty = true;
      history.push(exportState(), { coalesceKey });
      if (hooks && hooks.onDirty) hooks.onDirty();
      scheduleAutosave();
    }

    function scheduleAutosave() {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      const enabled = !(hooks && hooks.autosaveEnabled === false);
      if (!enabled) return;
      autosaveTimer = setTimeout(() => {
        if (hooks && hooks.onAutosave) hooks.onAutosave(exportState());
        dirty = false;
      }, 3000);
    }

    function flushAutosave() {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      if (dirty && hooks && hooks.onAutosave) hooks.onAutosave(exportState());
      dirty = false;
    }

    function getCachedImage(assetId, dataURL) {
      if (imageCache.has(assetId)) return Promise.resolve(imageCache.get(assetId));
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(assetId, img);
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = dataURL;
      });
    }

    function clearSelectionChrome() {
      if (!uiLayer) return;
      uiLayer.destroyChildren();
      uiLayer.batchDraw();
      // Reset panel border strokes without destroying art
      if (panelLayer) {
        panelLayer.find('.panel-border').forEach((b) => {
          b.stroke('#12110F');
          b.strokeWidth(4);
        });
        panelLayer.find('.art').forEach((a) => { a.draggable(false); });
        panelLayer.batchDraw();
      }
      if (nodeLayer) {
        nodeLayer.find('.sel-ring').forEach((n) => n.destroy());
        nodeLayer.find('.tail-tip').forEach((t) => {
          t.opacity(0.001);
          t.radius(10);
        });
        nodeLayer.batchDraw();
      }
    }

    function paintSelectionChrome() {
      if (!uiLayer) return;
      uiLayer.destroyChildren();

      if (selectedKind === 'panel' && selectedId) {
        const group = panelLayer.findOne('#panel-' + selectedId);
        if (group) {
          const border = group.findOne('.panel-border');
          if (border) {
            border.stroke('#FF4D2E');
            border.strokeWidth(6);
          }
          const art = group.findOne('.art');
          if (art) art.draggable(true);
          panelLayer.batchDraw();
        }
      } else if (selectedKind === 'node' && selectedId) {
        const group = nodeLayer.findOne('#node-' + selectedId);
        if (group) {
          const bw = group.width() || (bundle.nodes.find((n) => n.id === selectedId) || {}).w || 160;
          const bh = group.height() || (bundle.nodes.find((n) => n.id === selectedId) || {}).h || 80;
          const n = (bundle.nodes || []).find((x) => x.id === selectedId);
          const w = (n && n.w) || bw;
          const h = (n && n.h) || bh;
          group.find('.sel-ring').forEach((r) => r.destroy());
          group.add(new Konva.Rect({
            width: w, height: h, stroke: '#FF4D2E', strokeWidth: 2,
            dash: [6, 4], listening: false, name: 'sel-ring',
          }));
          const tip = group.findOne('.tail-tip');
          if (tip) {
            tip.opacity(1);
            tip.radius(14);
            tip.stroke('#fff');
            tip.strokeWidth(3);
            tip.shadowColor('rgba(0,0,0,0.35)');
            tip.shadowBlur(8);
            tip.shadowEnabled(true);
          }
          nodeLayer.batchDraw();
        }
      }
      uiLayer.batchDraw();
    }

    function redraw(full) {
      if (!ready || !bundle) return;
      panelLayer.destroyChildren();
      nodeLayer.destroyChildren();
      uiLayer.destroyChildren();

      const w = bundle.project.width || 800;
      const h = Math.max(bundle.project.height || 1200, 400);
      panelLayer.add(new Konva.Rect({
        x: 0, y: 0, width: w, height: h, fill: '#F6F1E8', name: 'page-bg',
      }));

      const panels = (bundle.panels || []).slice().sort((a, b) => a.order - b.order);
      panels.forEach((p) => drawPanel(p));
      (bundle.nodes || []).forEach((n) => drawNode(n));
      paintSelectionChrome();
      panelLayer.batchDraw();
      nodeLayer.batchDraw();
      if (hooks && hooks.onRedraw) hooks.onRedraw(bundle);
    }

    function drawPanel(p) {
      const group = new Konva.Group({
        x: p.x, y: p.y, name: 'panel', id: 'panel-' + p.id, draggable: false,
      });
      // Clip group so art doesn't spill
      group.clip({ x: 0, y: 0, width: p.w, height: p.h });

      const fill = new Konva.Rect({
        width: p.w, height: p.h,
        fill: p.placeholderColor || '#d9d0c3',
        name: 'panel-fill',
      });
      group.add(fill);

      if (!p.artAssetId) {
        const inset = 16;
        group.add(new Konva.Rect({
          x: inset, y: inset, width: p.w - inset * 2, height: p.h - inset * 2,
          stroke: '#12110F', strokeWidth: 2, dash: [10, 8],
          opacity: 0.35, listening: false, name: 'empty-dash',
        }));
        group.add(new Konva.Text({
          x: 20, y: p.h / 2 - 18, width: p.w - 40,
          text: 'Drop a photo or shoot',
          fontSize: Math.min(28, Math.max(16, p.w / 18)),
          fontFamily: 'Comic Neue, Kosugi Maru, sans-serif',
          fill: '#12110F', opacity: 0.45, align: 'center',
          listening: false, name: 'empty-label',
        }));
      } else {
        const asset = (bundle.assets || []).find((a) => a.id === p.artAssetId);
        if (asset && asset.dataURL) {
          getCachedImage(asset.id, asset.dataURL).then((img) => {
            if (!img) return;
            // Panel may have been destroyed — check still exists
            const g = panelLayer && panelLayer.findOne('#panel-' + p.id);
            if (!g) return;
            // Remove prior art if any
            g.find('.art').forEach((a) => a.destroy());
            const mode = p.fit || 'cover';
            const fit = mode === 'contain'
              ? U().fitContain(img.width, img.height, p.w, p.h)
              : U().fitCover(img.width, img.height, p.w, p.h);
            const kImg = new Konva.Image({
              image: img,
              x: fit.x + (p.artX || 0),
              y: fit.y + (p.artY || 0),
              width: fit.w * (p.artScale || 1),
              height: fit.h * (p.artScale || 1),
              name: 'art',
              draggable: selectedId === p.id && selectedKind === 'panel',
            });
            g.add(kImg);
            const border = g.findOne('.panel-border');
            if (border) border.moveToTop();
            kImg.on('dragend', () => {
              p.artX = (kImg.x() - fit.x);
              p.artY = (kImg.y() - fit.y);
              markDirty('art-transform');
            });
            panelLayer.batchDraw();
          });
        }
      }

      const border = new Konva.Rect({
        width: p.w, height: p.h,
        stroke: selectedId === p.id && selectedKind === 'panel' ? '#FF4D2E' : '#12110F',
        strokeWidth: selectedId === p.id && selectedKind === 'panel' ? 6 : 4,
        listening: false,
        name: 'panel-border',
      });
      group.add(border);
      group.on('click tap', (e) => {
        e.cancelBubble = true;
        select('panel', p.id);
      });
      panelLayer.add(group);
    }

    function drawNode(n) {
      if (n.type === 'sticker') {
        const group = new Konva.Group({
          x: n.x, y: n.y, draggable: true, id: 'node-' + n.id, name: 'sticker',
        });
        const path = n.stickerPath;
        const applyImg = (img) => {
          group.destroyChildren();
          group.add(new Konva.Image({ image: img, width: n.w || 80, height: n.h || 80, name: 'sticker-img' }));
          if (selectedId === n.id && selectedKind === 'node') {
            group.add(new Konva.Rect({
              width: n.w || 80, height: n.h || 80, stroke: '#FF4D2E',
              strokeWidth: 2, dash: [6, 4], listening: false, name: 'sel-ring',
            }));
          }
          nodeLayer.batchDraw();
        };
        if (stickerCache.has(path)) {
          applyImg(stickerCache.get(path));
        } else {
          const img = new Image();
          img.onload = () => {
            stickerCache.set(path, img);
            applyImg(img);
          };
          img.src = path;
        }
        group.on('click tap', (e) => { e.cancelBubble = true; select('node', n.id); });
        group.on('dragend', () => {
          n.x = group.x(); n.y = group.y();
          markDirty('node-drag');
        });
        nodeLayer.add(group);
        return;
      }
      if (n.type !== 'balloon' && n.type !== 'caption') return;
      const group = new Konva.Group({
        x: n.x, y: n.y, draggable: true, id: 'node-' + n.id, name: 'balloon',
      });
      const bw = n.w || 160, bh = n.h || 80;
      let shape;
      if (n.type === 'caption') {
        shape = new Konva.Rect({
          width: bw, height: bh, fill: '#F5C518', stroke: '#12110F',
          strokeWidth: 3, cornerRadius: 8, name: 'balloon-shape',
        });
      } else if (n.shape === 'thought') {
        shape = new Konva.Rect({
          width: bw, height: bh, fill: '#fff', stroke: '#12110F',
          strokeWidth: 3, cornerRadius: 28, name: 'balloon-shape',
        });
      } else {
        shape = new Konva.Ellipse({
          x: bw / 2, y: bh / 2, radiusX: bw / 2, radiusY: bh / 2,
          fill: '#fff', stroke: '#12110F', strokeWidth: 3, name: 'balloon-shape',
        });
      }
      group.add(shape);
      if (n.tail && n.type === 'balloon') {
        const tail = new Konva.Line({
          points: [bw * 0.42, bh - 2, n.tail.x - n.x, n.tail.y - n.y, bw * 0.58, bh - 2],
          fill: '#fff', stroke: '#12110F', strokeWidth: 3, closed: true, name: 'tail',
        });
        group.add(tail);
        const tipSelected = selectedId === n.id && selectedKind === 'node';
        const tip = new Konva.Circle({
          x: n.tail.x - n.x, y: n.tail.y - n.y,
          radius: tipSelected ? 14 : 10,
          fill: '#FF4D2E',
          opacity: tipSelected ? 1 : 0.001,
          stroke: tipSelected ? '#fff' : undefined,
          strokeWidth: tipSelected ? 3 : 0,
          shadowColor: tipSelected ? 'rgba(0,0,0,0.35)' : undefined,
          shadowBlur: tipSelected ? 8 : 0,
          shadowEnabled: tipSelected,
          draggable: true, name: 'tail-tip',
        });
        tip.on('dragmove', () => {
          n.tail.x = group.x() + tip.x();
          n.tail.y = group.y() + tip.y();
          tail.points([bw * 0.42, bh - 2, tip.x(), tip.y(), bw * 0.58, bh - 2]);
        });
        tip.on('dragend', () => markDirty('tail'));
        tip.on('mousedown touchstart', (e) => { e.cancelBubble = true; });
        group.add(tip);
      }
      const text = new Konva.Text({
        x: 12, y: 16, width: bw - 24,
        text: n.text || 'Say something',
        fontSize: n.fontSize || 22,
        fontFamily: 'Comic Neue, Kosugi Maru, sans-serif',
        fill: '#12110F',
        align: 'center',
        listening: false,
        name: 'balloon-text',
      });
      group.add(text);
      autoResizeBalloon(n, group, shape, text);
      group.on('click tap', (e) => {
        e.cancelBubble = true;
        select('node', n.id);
        if (hooks && hooks.onBalloonTap) hooks.onBalloonTap(n, e);
      });
      group.on('dblclick dbltap', () => {
        if (hooks && hooks.onBalloonEdit) hooks.onBalloonEdit(n);
      });
      group.on('dragend', () => {
        n.x = group.x(); n.y = group.y();
        markDirty('node-drag');
      });
      if (selectedId === n.id && selectedKind === 'node') {
        group.add(new Konva.Rect({
          width: n.w || bw, height: n.h || bh, stroke: '#FF4D2E', strokeWidth: 2,
          dash: [6, 4], listening: false, name: 'sel-ring',
        }));
      }
      nodeLayer.add(group);
    }

    function autoResizeBalloon(n, group, shape, textNode) {
      const padding = 28;
      const tw = Math.max(120, textNode.width());
      const th = Math.max(60, textNode.height() + padding);
      n.w = Math.max(n.w || 160, tw + 24);
      n.h = Math.max(th, 70);
      textNode.width(n.w - 24);
      if (shape.getClassName && shape.getClassName() === 'Ellipse') {
        shape.position({ x: n.w / 2, y: n.h / 2 });
        shape.radiusX(n.w / 2); shape.radiusY(n.h / 2);
      } else {
        shape.width(n.w); shape.height(n.h);
      }
    }

    function select(kind, id, opts) {
      const same = selectedKind === kind && selectedId === id;
      if (same && !(opts && opts.force)) {
        if (hooks && hooks.onSelect) hooks.onSelect(kind, id);
        return;
      }
      // Cheap path: update chrome only when possible
      const prevKind = selectedKind;
      const prevId = selectedId;
      selectedKind = kind;
      selectedId = id;

      // If only selection chrome changes and both are panels/nodes already drawn, skip full redraw
      if (prevId && panelLayer && nodeLayer) {
        clearSelectionChrome();
        paintSelectionChrome();
        if (hooks && hooks.onSelect) hooks.onSelect(kind, id);
        return;
      }
      // First selection after load — chrome only
      paintSelectionChrome();
      if (hooks && hooks.onSelect) hooks.onSelect(kind, id);
    }

    function scrollToPanel(id) {
      if (!bundle || !stage) return;
      const p = (bundle.panels || []).find((x) => x.id === id);
      if (!p) return;
      const targetY = -(p.y * scale) + 40;
      stage.position({
        x: stage.x(),
        y: targetY,
      });
      stage.batchDraw();
    }

    function undo() {
      const s = history.undo();
      if (!s) return;
      bundle = s;
      redraw(true);
      dirty = true;
      scheduleAutosave();
      if (hooks && hooks.onDirty) hooks.onDirty();
    }
    function redo() {
      const s = history.redo();
      if (!s) return;
      bundle = s;
      redraw(true);
      dirty = true;
      scheduleAutosave();
      if (hooks && hooks.onDirty) hooks.onDirty();
    }

    function reflowVerticalStrip() {
      const g = global.DialogueFormats.gutterForWidth(bundle.project.width || 800);
      const panels = (bundle.panels || []).slice().sort((a, b) => a.order - b.order);
      let y = g;
      panels.forEach((p, i) => {
        p.order = i;
        p.x = g;
        p.y = y;
        // keep width consistent for stack layouts
        if (panels.length && Math.abs(p.w - ((bundle.project.width || 800) - g * 2)) < 2) {
          p.w = (bundle.project.width || 800) - g * 2;
        }
        y += p.h + g;
      });
      bundle.project.height = Math.max(y, bundle.project.height || 0);
      if (bundle.pages && bundle.pages[0]) bundle.pages[0].height = bundle.project.height;
    }

    function addPanel() {
      const panels = bundle.panels || [];
      const g = global.DialogueFormats.gutterForWidth(bundle.project.width || 800);
      const w = (bundle.project.width || 800) - g * 2;
      const sorted = panels.slice().sort((a, b) => a.order - b.order);
      const last = sorted[sorted.length - 1];
      const h = last ? last.h : Math.round(w * 9 / 16);
      const panel = {
        id: U().uid('panel'), pageId: bundle.pages[0].id, order: panels.length,
        x: g, y: 0, w, h, fit: 'cover', artX: 0, artY: 0, artScale: 1,
        placeholderColor: '#cfc4b4',
      };
      bundle.panels.push(panel);
      reflowVerticalStrip();
      markDirty();
      redraw(true);
      select('panel', panel.id);
      scrollToPanel(panel.id);
      return panel;
    }

    function duplicatePanel() {
      if (selectedKind !== 'panel' || !selectedId) return;
      const src = bundle.panels.find((p) => p.id === selectedId);
      if (!src) return;
      const copy = Object.assign({}, src, {
        id: U().uid('panel'),
        order: bundle.panels.length,
      });
      bundle.panels.push(copy);
      reflowVerticalStrip();
      markDirty(); redraw(true); select('panel', copy.id);
    }

    function deleteSelected() {
      if (selectedKind === 'panel' && selectedId) {
        bundle.panels = bundle.panels.filter((p) => p.id !== selectedId);
        bundle.nodes = (bundle.nodes || []).filter((n) => n.panelId !== selectedId);
        selectedId = null; selectedKind = null;
        reflowVerticalStrip();
        markDirty(); redraw(true);
      } else if (selectedKind === 'node' && selectedId) {
        bundle.nodes = bundle.nodes.filter((n) => n.id !== selectedId);
        selectedId = null; selectedKind = null;
        markDirty(); redraw(true);
      }
    }

    function reorderPanel(id, dir) {
      const panels = bundle.panels.slice().sort((a, b) => a.order - b.order);
      const i = panels.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= panels.length) return;
      const tmpOrder = panels[i].order;
      panels[i].order = panels[j].order;
      panels[j].order = tmpOrder;
      // Re-assign sequential orders then reflow y with gutters
      panels.sort((a, b) => a.order - b.order).forEach((p, idx) => { p.order = idx; });
      reflowVerticalStrip();
      markDirty();
      redraw(true);
      select('panel', id);
    }

    function addBalloon(shape) {
      const panel = selectedKind === 'panel'
        ? bundle.panels.find((p) => p.id === selectedId)
        : (bundle.panels || []).slice().sort((a, b) => a.order - b.order)[0];
      if (!panel) return null;
      const n = {
        id: U().uid('node'),
        type: shape === 'caption' ? 'caption' : 'balloon',
        shape: shape || 'speech',
        panelId: panel.id,
        pageId: panel.pageId,
        x: panel.x + 40,
        y: panel.y + 40,
        w: 200, h: 90,
        text: 'Say something',
        fontSize: 22,
        tail: shape === 'caption' ? null : { x: panel.x + 100, y: panel.y + 160 },
      };
      bundle.nodes.push(n);
      markDirty(); redraw(true); select('node', n.id);
      if (hooks && hooks.onBalloonEdit) hooks.onBalloonEdit(n);
      return n;
    }

    function setBalloonText(id, text, fontSize) {
      const n = bundle.nodes.find((x) => x.id === id);
      if (!n) return;
      n.text = text || 'Say something';
      if (fontSize) n.fontSize = fontSize;
      markDirty('lettering');
      redraw(true);
      select('node', id);
    }

    function ensurePanelForArt() {
      if (selectedKind === 'panel' && selectedId) {
        const p = bundle.panels.find((x) => x.id === selectedId);
        if (p) return p;
      }
      const sorted = (bundle.panels || []).slice().sort((a, b) => a.order - b.order);
      const empty = sorted.find((p) => !p.artAssetId);
      if (empty) {
        select('panel', empty.id);
        return empty;
      }
      if (sorted[0]) {
        select('panel', sorted[0].id);
        return sorted[0];
      }
      return addPanel();
    }

    function setPanelArt(asset, fit) {
      const p = ensurePanelForArt();
      if (!p) return;
      if (!bundle.assets) bundle.assets = [];
      // dedupe by id
      if (!bundle.assets.find((a) => a.id === asset.id)) bundle.assets.push(asset);
      p.artAssetId = asset.id;
      p.fit = fit || 'cover';
      p.artX = 0; p.artY = 0; p.artScale = 1;
      if (!bundle.project.coverAssetId) bundle.project.coverAssetId = asset.id;
      markDirty();
      redraw(true);
      select('panel', p.id);
    }

    function setFit(fit) {
      if (selectedKind !== 'panel' || !selectedId) return;
      const p = bundle.panels.find((x) => x.id === selectedId);
      if (!p) return;
      p.fit = fit; markDirty(); redraw(true);
    }

    function addSticker(path) {
      const panel = selectedKind === 'panel'
        ? bundle.panels.find((p) => p.id === selectedId)
        : (bundle.panels || [])[0];
      if (!panel) return;
      // Normalize to absolute /dialogue/stickers/...
      let stickerPath = path;
      if (stickerPath && !stickerPath.startsWith('/') && !stickerPath.startsWith('http')) {
        stickerPath = '/dialogue/' + stickerPath.replace(/^\.\//, '');
      }
      if (stickerPath && stickerPath.includes('stickers/') && !stickerPath.startsWith('/dialogue/')) {
        const name = stickerPath.split('/').pop();
        stickerPath = '/dialogue/stickers/' + name;
      }
      const n = {
        id: U().uid('node'), type: 'sticker', stickerPath,
        panelId: panel.id, pageId: panel.pageId,
        x: panel.x + 20, y: panel.y + 20, w: 80, h: 80,
      };
      bundle.nodes.push(n);
      markDirty(); redraw(true); select('node', n.id);
    }

    function destroy() {
      flushAutosave();
      window.removeEventListener('resize', resize);
      if (resizeObs) {
        try { resizeObs.disconnect(); } catch (_) {}
        resizeObs = null;
      }
      if (stage) stage.destroy();
      stage = null;
      ready = false;
      imageCache.clear();
    }

    // Kick off async init; API available immediately
    const initPromise = init();

    return {
      loadBundle, getBundle, exportState, redraw, fitView, resize, undo, redo,
      addPanel, duplicatePanel, deleteSelected, reorderPanel, reflowVerticalStrip,
      addBalloon, setBalloonText, setPanelArt, setFit, addSticker,
      select, scrollToPanel, flushAutosave, destroy, markDirty, ensurePanelForArt,
      canUndo: () => history.canUndo(), canRedo: () => history.canRedo(),
      getSelection: () => ({ kind: selectedKind, id: selectedId }),
      whenReady: () => initPromise,
    };
  }

  global.DialogueEditor = { createEditor };
})(typeof window !== 'undefined' ? window : globalThis);
