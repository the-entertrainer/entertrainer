(function (global) {
  const U = () => global.DialogueUtils;
  const F = () => global.DialogueFormats;

  function placeholderDataURL(w, h, c1, c2, label) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(18,17,15,.55)';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(label || '', 24, h - 28);
    // simple bus / night shapes
    if (label === 'stop') {
      ctx.fillStyle = '#F5C518';
      ctx.fillRect(w * 0.2, h * 0.35, w * 0.6, h * 0.25);
      ctx.fillStyle = '#12110F';
      ctx.fillRect(w * 0.28, h * 0.4, w * 0.18, h * 0.12);
      ctx.fillRect(w * 0.55, h * 0.4, w * 0.18, h * 0.12);
    }
    if (label === 'rain') {
      ctx.strokeStyle = 'rgba(243,238,230,.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 40; i++) {
        const x = (i * 47) % w, y = (i * 89) % h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 28); ctx.stroke();
      }
    }
    if (label === 'talk') {
      ctx.fillStyle = '#FF4D2E';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.45, w * 0.22, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas.toDataURL('image/png');
  }

  async function ensureDemo() {
    const seeded = await global.DialogueDB.getMeta('demoSeeded', false);
    if (seeded) return;
    const existing = await global.DialogueDB.listProjects();
    if (existing.length) {
      await global.DialogueDB.setMeta('demoSeeded', true);
      return;
    }
    await createLastBus();
    await global.DialogueDB.setMeta('demoSeeded', true);
  }

  async function createLastBus() {
    const format = F().FORMATS.webtoon;
    const layout = F().LAYOUTS.stack3;
    const rects = F().layoutRects(format, layout);
    // add a 4th panel
    const g = F().gutterForWidth(format.width);
    const last = rects[rects.length - 1];
    rects.push({ x: g, y: last.y + last.h + g, w: format.width - g * 2, h: last.h });

    const project = global.DialogueDB.emptyProject({
      title: 'The Last Bus',
      formatId: 'webtoon',
      width: 800,
      height: rects[rects.length - 1].y + rects[rects.length - 1].h + g,
    });
    const page = {
      id: U().uid('page'),
      projectId: project.id,
      order: 0,
      width: format.width,
      height: project.height,
    };
    const colors = [
      ['#1a2744', '#3d4f6f', 'rain'],
      ['#2b2a28', '#5c5346', 'stop'],
      ['#3a1f1c', '#7a3b32', 'talk'],
      ['#12110F', '#2a2926', 'rain'],
    ];
    const assets = [];
    const panels = [];
    for (let i = 0; i < rects.length; i++) {
      const dataURL = placeholderDataURL(800, 600, colors[i][0], colors[i][1], colors[i][2]);
      const asset = {
        id: U().uid('asset'),
        projectId: project.id,
        mime: 'image/png',
        name: 'panel-' + (i + 1) + '.png',
        dataURL,
        createdAt: U().now(),
      };
      assets.push(asset);
      panels.push({
        id: U().uid('panel'),
        pageId: page.id,
        order: i,
        x: rects[i].x, y: rects[i].y, w: rects[i].w, h: rects[i].h,
        artAssetId: asset.id,
        fit: 'cover',
        artX: 0, artY: 0, artScale: 1,
        placeholderColor: colors[i][0],
      });
    }
    const nodes = [
      {
        id: U().uid('node'), type: 'balloon', shape: 'speech',
        panelId: panels[0].id, pageId: page.id,
        x: panels[0].x + 40, y: panels[0].y + 40, w: 280, h: 100,
        text: 'Missed it again…',
        tail: { x: panels[0].x + 120, y: panels[0].y + 200 },
        fontSize: 24,
      },
      {
        id: U().uid('node'), type: 'balloon', shape: 'thought',
        panelId: panels[1].id, pageId: page.id,
        x: panels[1].x + 80, y: panels[1].y + 60, w: 300, h: 110,
        text: 'Or did it miss me?',
        tail: { x: panels[1].x + 200, y: panels[1].y + 220 },
        fontSize: 24,
      },
      {
        id: U().uid('node'), type: 'balloon', shape: 'speech',
        panelId: panels[2].id, pageId: page.id,
        x: panels[2].x + 60, y: panels[2].y + 80, w: 360, h: 120,
        text: 'Did the bus just… talk?',
        tail: { x: panels[2].x + 220, y: panels[2].y + 260 },
        fontSize: 26,
      },
      {
        id: U().uid('node'), type: 'caption', shape: 'caption',
        panelId: panels[3].id, pageId: page.id,
        x: panels[3].x + 40, y: panels[3].y + panels[3].h - 100, w: 420, h: 70,
        text: 'Tonight, the route ends here.',
        fontSize: 22,
      },
    ];
    project.coverAssetId = assets[0].id;
    await global.DialogueDB.saveProjectBundle({ project, pages: [page], panels, nodes, assets });
    return project;
  }

  global.DialogueDemo = { ensureDemo, createLastBus };
})(typeof window !== 'undefined' ? window : globalThis);
