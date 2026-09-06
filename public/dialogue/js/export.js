(function (global) {
  const U = () => global.DialogueUtils;

  function makePlaceholderCanvas(w, h, panels, nodes) {
    const canvas = typeof document !== 'undefined'
      ? document.createElement('canvas')
      : null;
    if (!canvas) return null;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F6F1E8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#12110F';
    ctx.lineWidth = 4;
    (panels || []).forEach((p) => {
      ctx.fillStyle = '#e5ddd0';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      if (p.artDataURL) {
        // drawn async elsewhere
      }
    });
    (nodes || []).forEach((n) => {
      if (n.type !== 'balloon' && n.type !== 'caption') return;
      const x = n.x || 0, y = n.y || 0, bw = n.w || 160, bh = n.h || 80;
      ctx.fillStyle = n.type === 'caption' ? '#F5C518' : '#fff';
      ctx.strokeStyle = '#12110F';
      ctx.lineWidth = 3;
      if (n.shape === 'thought') {
        roundRect(ctx, x, y, bw, bh, 24);
      } else if (n.type === 'caption') {
        roundRect(ctx, x, y, bw, bh, 8);
      } else {
        ellipse(ctx, x, y, bw, bh);
      }
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#12110F';
      ctx.font = '20px Comic Neue, sans-serif';
      wrapText(ctx, n.text || 'Say something', x + 12, y + 28, bw - 24, 24);
      if (n.tail && n.shape !== 'caption') {
        ctx.beginPath();
        ctx.moveTo(x + bw * 0.4, y + bh);
        ctx.lineTo(n.tail.x, n.tail.y);
        ctx.lineTo(x + bw * 0.55, y + bh);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill(); ctx.stroke();
      }
    });
    return canvas;
  }

  function ellipse(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = String(text).split(/\s+/);
    let line = '';
    let yy = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy);
        line = word;
        yy += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, yy);
  }

  async function renderBundleToCanvas(bundle, assetMap) {
    const project = bundle.project;
    const w = project.width || 800;
    const panels = bundle.panels || [];
    let maxY = 0;
    panels.forEach((p) => { maxY = Math.max(maxY, (p.y || 0) + (p.h || 0)); });
    const h = Math.max(project.height || 0, maxY + 24, 400);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F6F1E8';
    ctx.fillRect(0, 0, w, h);

    for (const p of panels) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.w, p.h);
      ctx.clip();
      ctx.fillStyle = '#ddd6ca';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      if (p.artAssetId && assetMap && assetMap[p.artAssetId]) {
        const asset = assetMap[p.artAssetId];
        const img = await loadImage(asset.dataURL || asset.blob);
        const mode = p.fit || 'cover';
        const fit = mode === 'contain'
          ? U().fitContain(img.width, img.height, p.w, p.h)
          : U().fitCover(img.width, img.height, p.w, p.h);
        const ox = p.artX || 0, oy = p.artY || 0, sc = p.artScale || 1;
        ctx.drawImage(img, p.x + fit.x + ox, p.y + fit.y + oy, fit.w * sc, fit.h * sc);
      } else if (p.placeholderColor) {
        ctx.fillStyle = p.placeholderColor;
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
      ctx.restore();
      ctx.strokeStyle = '#12110F';
      ctx.lineWidth = 4;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    const nodes = bundle.nodes || [];
    for (const n of nodes) {
      if (n.type === 'sticker' && n.stickerPath) {
        try {
          const img = await loadImage(n.stickerPath);
          ctx.drawImage(img, n.x, n.y, n.w || 80, n.h || 80);
        } catch (_) {}
        continue;
      }
      if (n.type !== 'balloon' && n.type !== 'caption') continue;
      const x = n.x || 0, y = n.y || 0, bw = n.w || 160, bh = n.h || 80;
      ctx.fillStyle = n.type === 'caption' ? '#F5C518' : '#ffffff';
      ctx.strokeStyle = '#12110F';
      ctx.lineWidth = 3;
      if (n.shape === 'thought') roundRect(ctx, x, y, bw, bh, 28);
      else if (n.type === 'caption') roundRect(ctx, x, y, bw, bh, 8);
      else ellipse(ctx, x, y, bw, bh);
      ctx.fill(); ctx.stroke();
      if (n.tail && n.type === 'balloon') {
        ctx.beginPath();
        ctx.moveTo(x + bw * 0.42, y + bh - 2);
        ctx.lineTo(n.tail.x, n.tail.y);
        ctx.lineTo(x + bw * 0.58, y + bh - 2);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#12110F';
      ctx.font = `${n.fontSize || 22}px Comic Neue, sans-serif`;
      wrapText(ctx, n.text || 'Say something', x + 14, y + 30, bw - 28, (n.fontSize || 22) + 4);
    }
    return canvas;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (src instanceof Blob) {
        const url = URL.createObjectURL(src);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = reject;
        img.src = url;
        return;
      }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function exportPNG(bundle, assetMap, qualityNote) {
    const canvas = await renderBundleToCanvas(bundle, assetMap);
    return new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
  }

  async function exportJPG(bundle, assetMap, quality) {
    const canvas = await renderBundleToCanvas(bundle, assetMap);
    const q = quality == null ? 0.92 : quality;
    return new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', q));
  }

  async function exportWebtoonZip(bundle, assetMap, onProgress) {
    const canvas = await renderBundleToCanvas(bundle, assetMap);
    const slices = U().sliceWebtoon(canvas.width, canvas.height, 1280);
    const zip = new JSZip();
    for (let i = 0; i < slices.length; i++) {
      const s = slices[i];
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = s.width;
      sliceCanvas.height = s.height;
      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, s.y, s.width, s.height, 0, 0, s.width, s.height);
      const blob = await new Promise((r) => sliceCanvas.toBlob(r, 'image/jpeg', 0.92));
      zip.file(s.name, blob);
      if (onProgress) onProgress((i + 1) / slices.length);
    }
    return zip.generateAsync({ type: 'blob' });
  }

  async function exportPDF(bundle, assetMap, onProgress) {
    const canvas = await renderBundleToCanvas(bundle, assetMap);
    if (onProgress) onProgress(0.5);
    const img = canvas.toDataURL('image/jpeg', 0.92);
    const JsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
    const pdf = new JsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ['px_scaling'],
    });
    pdf.addImage(img, 'JPEG', 0, 0, canvas.width, canvas.height);
    if (onProgress) onProgress(1);
    return pdf.output('blob');
  }

  async function projectZip(bundle, assetMap, onProgress) {
    const zip = new JSZip();
    const projectJson = {
      version: 1,
      project: bundle.project,
      pages: bundle.pages,
      panels: bundle.panels,
      nodes: bundle.nodes.map((n) => {
        const copy = Object.assign({}, n);
        return copy;
      }),
      assetIndex: (bundle.assets || []).map((a) => ({ id: a.id, mime: a.mime, name: a.name })),
    };
    zip.file('project.json', JSON.stringify(projectJson, null, 2));
    const assetsFolder = zip.folder('assets');
    const assets = bundle.assets || [];
    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      const ext = (a.mime || 'image/png').split('/')[1] || 'png';
      let data = a.blob;
      if (!data && a.dataURL) data = await U().dataURLToBlob(a.dataURL);
      if (data) assetsFolder.file(a.id + '.' + ext.replace('jpeg', 'jpg'), data);
      if (onProgress) onProgress((i + 1) / Math.max(assets.length, 1) * 0.7);
    }
    try {
      const cover = await exportPNG(bundle, assetMap);
      zip.file('cover.png', cover);
    } catch (_) {}
    if (onProgress) onProgress(1);
    return zip.generateAsync({ type: 'blob' });
  }

  global.DialogueExport = {
    renderBundleToCanvas, exportPNG, exportJPG, exportWebtoonZip, exportPDF, projectZip,
    sliceWebtoon: (...args) => U().sliceWebtoon(...args),
    comicInfo: (project) => U().comicInfoXml(project),
    makePlaceholderCanvas,
  };
})(typeof window !== 'undefined' ? window : globalThis);
