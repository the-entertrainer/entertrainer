(function (global) {
  const U = () => global.DialogueUtils;

  function createEditor(host, hooks) {
    let stage, layer, panelLayer, nodeLayer, uiLayer;
    let bundle = null;
    let selectedId = null;
    let selectedKind = null; // panel | node
    let scale = 1;
    let history = global.DialogueHistory.createHistory(50);
    let autosaveTimer = null;
    let dirty = false;
    let transforming = false;

    function init() {
      const w = host.clientWidth || 390;
      const h = host.clientHeight || 600;
      stage = new Konva.Stage({ container: host, width: w, height: h, draggable: false });
      panelLayer = new Konva.Layer({ name: 'panels' });
      nodeLayer = new Konva.Layer({ name: 'nodes' });
      uiLayer = new Konva.Layer({ name: 'ui' });
      layer = panelLayer;
      stage.add(panelLayer);
      stage.add(nodeLayer);
      stage.add(uiLayer);
      setupGestures();
      window.addEventListener('resize', resize);
    }

    function resize() {
      if (!stage) return;
      stage.width(host.clientWidth);
      stage.height(host.clientHeight);
      fitView();
    }

    function setupGestures() {
      let lastDist = 0;
      let lastCenter = null;
      stage.on('touchmove', (e) => {
        const touches = e.evt.touches;
        if (touches.length === 2) {
          e.evt.preventDefault();
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
      // wheel zoom desktop
      stage.on('wheel', (e) => {
        e.evt.preventDefault();
        const oldScale = scale;
        const pointer = stage.getPointerPosition();
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

    function fitView() {
      if (!bundle || !stage) return;
      const w = bundle.project.width || 800;
      const h = Math.max(bundle.project.height || 1200, 400);
      const pad = 24;
      const sx = (stage.width() - pad * 2) / w;
      const sy = (stage.height() - pad * 2) / h;
      scale = U().clamp(Math.min(sx, sy), 0.2, 2);
      stage.scale({ x: scale, y: scale });
      stage.position({
        x: (stage.width() - w * scale) / 2,
        y: pad,
      });
    }

    function loadBundle(b, opts) {
      bundle = U().deepClone(b);
      if (!opts || !opts.skipHistory) history.seed(exportState());
      redraw();
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

    function redraw() {
      panelLayer.destroyChildren();
      nodeLayer.destroyChildren();
      uiLayer.destroyChildren();
      if (!bundle) return;

      const w = bundle.project.width || 800;
      const h = Math.max(bundle.project.height || 1200, 400);
      panelLayer.add(new Konva.Rect({
        x: 0, y: 0, width: w, height: h, fill: '#F6F1E8', name: 'page-bg',
      }));

      const panels = (bundle.panels || []).slice().sort((a, b) => a.order - b.order);
      panels.forEach((p) => {
        const group = new Konva.Group({
          x: p.x, y: p.y, name: 'panel', id: 'panel-' + p.id, draggable: false,
        });
        const clip = new Konva.Rect({ width: p.w, height: p.h, fill: p.placeholderColor || '#d9d0c3' });
        group.add(clip);
        const border = new Konva.Rect({
          width: p.w, height: p.h, stroke: selectedId === p.id && selectedKind === 'panel' ? '#FF4D2E' : '#12110F',
          strokeWidth: selectedId === p.id && selectedKind === 'panel' ? 6 : 4, listening: false,
        });
        if (p.artAssetId) {
          const asset = (bundle.assets || []).find((a) => a.id === p.artAssetId);
          if (asset && asset.dataURL) {
            const img = new Image();
            img.onload = () => {
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
              group.add(kImg);
              border.moveToTop();
              kImg.on('dragend', () => {
                p.artX = (kImg.x() - fit.x);
                p.artY = (kImg.y() - fit.y);
                markDirty('art-transform');
              });
              panelLayer.batchDraw();
            };
            img.src = asset.dataURL;
          }
        }
        group.add(border);
        group.on('click tap', () => select('panel', p.id));
        panelLayer.add(group);
      });

      (bundle.nodes || []).forEach((n) => drawNode(n));
      panelLayer.batchDraw();
      nodeLayer.batchDraw();
      if (hooks && hooks.onRedraw) hooks.onRedraw(bundle);
    }

    function drawNode(n) {
      if (n.type === 'sticker') {
        const group = new Konva.Group({
          x: n.x, y: n.y, draggable: true, id: 'node-' + n.id, name: 'sticker',
        });
        const img = new Image();
        img.onload = () => {
          group.add(new Konva.Image({ image: img, width: n.w || 80, height: n.h || 80 }));
          nodeLayer.batchDraw();
        };
        img.src = n.stickerPath;
        group.on('click tap', () => select('node', n.id));
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
        shape = new Konva.Rect({ width: bw, height: bh, fill: '#F5C518', stroke: '#12110F', strokeWidth: 3, cornerRadius: 8 });
      } else if (n.shape === 'thought') {
        shape = new Konva.Rect({ width: bw, height: bh, fill: '#fff', stroke: '#12110F', strokeWidth: 3, cornerRadius: 28 });
      } else {
        shape = new Konva.Ellipse({
          x: bw / 2, y: bh / 2, radiusX: bw / 2, radiusY: bh / 2,
          fill: '#fff', stroke: '#12110F', strokeWidth: 3,
        });
      }
      group.add(shape);
      if (n.tail && n.type === 'balloon') {
        const tail = new Konva.Line({
          points: [bw * 0.42, bh - 2, n.tail.x - n.x, n.tail.y - n.y, bw * 0.58, bh - 2],
          fill: '#fff', stroke: '#12110F', strokeWidth: 3, closed: true,
        });
        group.add(tail);
        const tip = new Konva.Circle({
          x: n.tail.x - n.x, y: n.tail.y - n.y, radius: 10,
          fill: '#FF4D2E', opacity: selectedId === n.id ? 1 : 0.001,
          draggable: true, name: 'tail-tip',
        });
        tip.on('dragmove', () => {
          n.tail.x = group.x() + tip.x();
          n.tail.y = group.y() + tip.y();
          tail.points([bw * 0.42, bh - 2, tip.x(), tip.y(), bw * 0.58, bh - 2]);
        });
        tip.on('dragend', () => markDirty('tail'));
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
      });
      group.add(text);
      autoResizeBalloon(n, group, shape, text);
      group.on('click tap', (e) => {
        select('node', n.id);
        if (hooks && hooks.onBalloonTap) hooks.onBalloonTap(n, e);
      });
      group.on('dblclick dbltap', () => {
        if (hooks && hooks.onBalloonEdit) hooks.onBalloonEdit(n);
      });
      group.on('dragend', () => {
        n.x = group.x(); n.y = group.y();
        if (n.tail) {
          // keep relative tail absolute synced on next redraw
        }
        markDirty('node-drag');
      });
      if (selectedId === n.id && selectedKind === 'node') {
        group.add(new Konva.Rect({
          width: bw, height: bh, stroke: '#FF4D2E', strokeWidth: 2, dash: [6, 4], listening: false,
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

    function select(kind, id) {
      selectedKind = kind;
      selectedId = id;
      redraw();
      if (hooks && hooks.onSelect) hooks.onSelect(kind, id);
    }

    function undo() {
      const s = history.undo();
      if (!s) return;
      bundle = s;
      redraw();
      dirty = true;
      scheduleAutosave();
    }
    function redo() {
      const s = history.redo();
      if (!s) return;
      bundle = s;
      redraw();
      dirty = true;
      scheduleAutosave();
    }

    function addPanel() {
      const panels = bundle.panels || [];
      const g = global.DialogueFormats.gutterForWidth(bundle.project.width || 800);
      const w = (bundle.project.width || 800) - g * 2;
      const last = panels.slice().sort((a, b) => a.order - b.order).pop();
      const h = last ? last.h : Math.round(w * 9 / 16);
      const y = last ? last.y + last.h + g : g;
      const panel = {
        id: U().uid('panel'), pageId: bundle.pages[0].id, order: panels.length,
        x: g, y, w, h, fit: 'cover', artX: 0, artY: 0, artScale: 1,
        placeholderColor: '#cfc4b4',
      };
      bundle.panels.push(panel);
      bundle.project.height = Math.max(bundle.project.height || 0, y + h + g);
      markDirty();
      redraw();
      select('panel', panel.id);
    }

    function duplicatePanel() {
      if (selectedKind !== 'panel' || !selectedId) return;
      const src = bundle.panels.find((p) => p.id === selectedId);
      if (!src) return;
      const copy = Object.assign({}, src, { id: U().uid('panel'), order: bundle.panels.length, y: src.y + src.h + 24 });
      bundle.panels.push(copy);
      markDirty(); redraw(); select('panel', copy.id);
    }

    function deleteSelected() {
      if (selectedKind === 'panel' && selectedId) {
        bundle.panels = bundle.panels.filter((p) => p.id !== selectedId);
        bundle.nodes = bundle.nodes.filter((n) => n.panelId !== selectedId);
        selectedId = null; markDirty(); redraw();
      } else if (selectedKind === 'node' && selectedId) {
        bundle.nodes = bundle.nodes.filter((n) => n.id !== selectedId);
        selectedId = null; markDirty(); redraw();
      }
    }

    function reorderPanel(id, dir) {
      const panels = bundle.panels.slice().sort((a, b) => a.order - b.order);
      const i = panels.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= panels.length) return;
      const tmp = panels[i].order; panels[i].order = panels[j].order; panels[j].order = tmp;
      // also swap y positions roughly
      const ty = panels[i].y; panels[i].y = panels[j].y; panels[j].y = ty;
      markDirty(); redraw();
    }

    function addBalloon(shape) {
      const panel = selectedKind === 'panel'
        ? bundle.panels.find((p) => p.id === selectedId)
        : (bundle.panels || [])[0];
      if (!panel) return;
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
      markDirty(); redraw(); select('node', n.id);
      if (hooks && hooks.onBalloonEdit) hooks.onBalloonEdit(n);
    }

    function setBalloonText(id, text) {
      const n = bundle.nodes.find((x) => x.id === id);
      if (!n) return;
      n.text = text || 'Say something';
      markDirty('lettering');
      redraw();
    }

    function setPanelArt(asset, fit) {
      if (selectedKind !== 'panel' || !selectedId) return;
      const p = bundle.panels.find((x) => x.id === selectedId);
      if (!p) return;
      if (!bundle.assets) bundle.assets = [];
      bundle.assets.push(asset);
      p.artAssetId = asset.id;
      p.fit = fit || 'cover';
      p.artX = 0; p.artY = 0; p.artScale = 1;
      markDirty(); redraw();
    }

    function setFit(fit) {
      if (selectedKind !== 'panel' || !selectedId) return;
      const p = bundle.panels.find((x) => x.id === selectedId);
      if (!p) return;
      p.fit = fit; markDirty(); redraw();
    }

    function addSticker(path) {
      const panel = (bundle.panels || [])[0];
      if (!panel) return;
      const n = {
        id: U().uid('node'), type: 'sticker', stickerPath: path,
        panelId: panel.id, pageId: panel.pageId,
        x: panel.x + 20, y: panel.y + 20, w: 80, h: 80,
      };
      bundle.nodes.push(n);
      markDirty(); redraw();
    }

    function destroy() {
      flushAutosave();
      window.removeEventListener('resize', resize);
      if (stage) stage.destroy();
    }

    init();
    return {
      loadBundle, getBundle, exportState, redraw, fitView, undo, redo,
      addPanel, duplicatePanel, deleteSelected, reorderPanel,
      addBalloon, setBalloonText, setPanelArt, setFit, addSticker,
      select, flushAutosave, destroy, markDirty,
      canUndo: () => history.canUndo(), canRedo: () => history.canRedo(),
      getSelection: () => ({ kind: selectedKind, id: selectedId }),
    };
  }

  global.DialogueEditor = { createEditor };
})(typeof window !== 'undefined' ? window : globalThis);
