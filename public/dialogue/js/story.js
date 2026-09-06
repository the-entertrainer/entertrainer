(function (global) {
  const U = () => global.DialogueUtils;
  const F = () => global.DialogueFormats;
  const API = '/api/dialogue/story';

  async function health() {
    try {
      const res = await fetch(API, { method: 'GET', headers: { Accept: 'application/json' } });
      if (!res.ok) return { ok: false, status: res.status };
      return await res.json();
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : 'network' };
    }
  }

  async function call(action, payload) {
    const body = Object.assign({ action }, payload || {});
    let res;
    try {
      res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      const e = new Error('Could not reach story API. Check your connection.');
      e.cause = err;
      throw e;
    }
    let data = null;
    const text = await res.text().catch(() => '');
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = null;
    }
    if (!res.ok) {
      const msg =
        (data && (data.statusMessage || data.message || data.statusMessage)) ||
        (typeof data === 'string' ? data : '') ||
        text.slice(0, 200) ||
        ('Story API error ' + res.status);
      const e = new Error(msg);
      e.status = res.status;
      e.data = data;
      throw e;
    }
    return data || {};
  }

  function expand(plot, tone, density) {
    return call('expand', {
      plot,
      tone: tone || undefined,
      density: density || 'studio',
    });
  }

  function chat(messages, outline, density) {
    return call('chat', {
      messages,
      outline,
      density: density || (outline && outline.density) || 'studio',
    });
  }

  function densify(outline, density, plot) {
    return call('densify', {
      outline,
      density: density || (outline && outline.density) || 'studio',
      plot: plot || undefined,
    });
  }

  function bible(outline, density) {
    return call('bible', {
      outline,
      density: density || (outline && outline.density) || 'studio',
    });
  }

  function enrichBible(bibleDoc, outline, density) {
    return call('enrich_bible', {
      bible: bibleDoc,
      outline,
      density: density || (outline && outline.density) || 'studio',
    });
  }

  const BIBLE_MIN_CHARS = { draft: 4, studio: 6, epic: 8 };
  const BIBLE_MIN_LOCS = { draft: 3, studio: 5, epic: 6 };

  function bibleMinChars(density) {
    const d = density || 'studio';
    return BIBLE_MIN_CHARS[d] || BIBLE_MIN_CHARS.studio;
  }

  function bibleNeedsEnrich(bibleDoc, density) {
    const chars = (bibleDoc && bibleDoc.characters) || [];
    return chars.length < bibleMinChars(density);
  }

  function pages(outline, bibleDoc, chapterId, density) {
    return call('pages', {
      outline,
      bible: bibleDoc,
      chapterId: chapterId || undefined,
      density: density || (outline && outline.density) || 'studio',
    });
  }

  /** Studio/epic: generate per chapter and merge. Draft: one shot. */
  async function pagesForStory(outline, bibleDoc, density) {
    const d = density || (outline && outline.density) || 'studio';
    const chapters = (outline && outline.chapters) || [];
    if (d === 'draft' || !chapters.length) {
      return pages(outline, bibleDoc, undefined, d);
    }
    const allPages = [];
    const seen = new Set();
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const res = await pages(outline, bibleDoc, ch.id, d);
      const chunk = res.pages || [];
      for (const pg of chunk) {
        // Keep first cover, last back; skip duplicate covers from later chapters
        if (pg.kind === 'cover' && seen.has('__cover__')) continue;
        if (pg.kind === 'cover') seen.add('__cover__');
        if (pg.kind === 'back') {
          // defer backs until end
          continue;
        }
        if (!pg.chapterId && pg.kind === 'story') pg.chapterId = ch.id;
        allPages.push(pg);
      }
      // Collect back from last chapter only
      if (i === chapters.length - 1) {
        const backs = chunk.filter((p) => p.kind === 'back');
        allPages.push(...backs);
      }
    }
    return { pages: allPages };
  }

  function charLookup(bibleDoc) {
    const map = {};
    ((bibleDoc && bibleDoc.characters) || []).forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }

  /** Build a Dialogue project bundle from one story page spec. */
  function buildProjectFromStoryPage(story, storyPage) {
    const format = F().FORMATS.webtoon;
    const g = F().gutterForWidth(format.width);
    const panelSpecs = (storyPage.panels || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const count = Math.max(panelSpecs.length, 1);
    const panelH = Math.round(format.width * (9 / 16));
    const title = ((story && story.title) || 'Story') + ' — ' + ((storyPage && storyPage.title) || 'Page');
    const project = global.DialogueDB.emptyProject({
      title,
      formatId: format.id,
      width: format.width,
      height: null,
      gutter: g,
      borderWidth: 4,
      storyId: story && story.id,
      storyPageId: storyPage && storyPage.id,
    });
    const page = {
      id: U().uid('page'),
      projectId: project.id,
      order: 0,
      width: format.width,
      height: 0,
      kind: storyPage.kind || 'story',
    };
    const panels = [];
    const nodes = [];
    const assets = [];
    const storyAssets = (story && story.assets) || [];
    let y = g;
    const w = format.width - g * 2;
    const chars = charLookup(story.bible);

    function adoptAsset(assetId) {
      if (!assetId) return null;
      if (assets.find((a) => a.id === assetId)) return assetId;
      const src = storyAssets.find((a) => a.id === assetId);
      if (!src || !src.dataURL) return null;
      assets.push({
        id: src.id,
        projectId: project.id,
        mime: src.mime || 'image/png',
        name: src.name || 'mage-art.png',
        dataURL: src.dataURL,
        createdAt: src.createdAt || U().now(),
      });
      return src.id;
    }

    if (!panelSpecs.length) {
      panels.push({
        id: U().uid('panel'),
        pageId: page.id,
        order: 0,
        x: g, y, w, h: panelH,
        fit: 'cover', artX: 0, artY: 0, artScale: 1,
        placeholderColor: '#d5cbbd',
        imagePrompt: '',
        scene: '',
        storyPanelId: null,
      });
      y += panelH + g;
    } else {
      panelSpecs.forEach((spec, i) => {
        const h = panelH;
        const artId = adoptAsset(spec.artAssetId);
        const panel = {
          id: U().uid('panel'),
          pageId: page.id,
          order: i,
          x: g, y, w, h,
          fit: 'cover', artX: 0, artY: 0, artScale: 1,
          placeholderColor: i % 2 ? '#d5cbbd' : '#cfc4b4',
          imagePrompt: spec.imagePrompt || '',
          scene: spec.scene || '',
          shot: spec.shot || 'medium',
          storyPanelId: spec.id || null,
          storyCharacters: spec.characters || [],
          artAssetId: artId || null,
        };
        panels.push(panel);

        const lines = Array.isArray(spec.dialogue) ? spec.dialogue : [];
        lines.forEach((line, li) => {
          const balloon = line.balloon || 'speech';
          const speaker = line.speakerId && chars[line.speakerId]
            ? chars[line.speakerId].name
            : '';
          let text = String(line.text || '').trim();
          if (speaker && balloon !== 'caption' && text && !text.startsWith(speaker)) {
            // keep dialogue clean; speaker is metadata
          }
          const n = {
            id: U().uid('node'),
            type: balloon === 'caption' ? 'caption' : 'balloon',
            shape: balloon === 'thought' ? 'thought' : (balloon === 'caption' ? 'caption' : 'speech'),
            panelId: panel.id,
            pageId: page.id,
            x: panel.x + 36 + (li % 2) * 40,
            y: panel.y + 28 + li * 70,
            w: Math.min(240, panel.w - 60),
            h: balloon === 'caption' ? 70 : 90,
            text: text || (balloon === 'caption' ? '…' : '…'),
            fontSize: balloon === 'caption' ? 18 : 22,
            align: 'center',
            allCaps: false,
            speakerId: line.speakerId || null,
            tail: balloon === 'caption' ? null : { x: panel.x + 90, y: panel.y + 140 + li * 70 },
          };
          nodes.push(n);
        });

        y += h + g;
      });
    }

    page.height = y;
    project.height = y;
    if (assets.length && !project.coverAssetId) project.coverAssetId = assets[0].id;
    return { project, pages: [page], panels, nodes, assets };
  }

  global.DialogueStory = {
    health, call, expand, chat, densify, bible, enrichBible, bibleNeedsEnrich, bibleMinChars,
    BIBLE_MIN_CHARS, BIBLE_MIN_LOCS,
    pages, pagesForStory, buildProjectFromStoryPage, charLookup, API,
  };
})(typeof window !== 'undefined' ? window : globalThis);
