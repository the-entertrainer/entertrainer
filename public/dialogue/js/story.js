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

  function expand(plot, tone) {
    return call('expand', { plot, tone: tone || undefined });
  }

  function chat(messages, outline) {
    return call('chat', { messages, outline });
  }

  function bible(outline) {
    return call('bible', { outline });
  }

  function pages(outline, bibleDoc, chapterId) {
    return call('pages', {
      outline,
      bible: bibleDoc,
      chapterId: chapterId || undefined,
    });
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
    let y = g;
    const w = format.width - g * 2;
    const chars = charLookup(story.bible);

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
        const panel = {
          id: U().uid('panel'),
          pageId: page.id,
          order: i,
          x: g, y, w, h,
          fit: 'cover', artX: 0, artY: 0, artScale: 1,
          placeholderColor: i % 2 ? '#d5cbbd' : '#cfc4b4',
          imagePrompt: spec.imagePrompt || '',
          scene: spec.scene || '',
          storyPanelId: spec.id || null,
          storyCharacters: spec.characters || [],
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
    return { project, pages: [page], panels, nodes, assets: [] };
  }

  global.DialogueStory = {
    health, call, expand, chat, bible, pages, buildProjectFromStoryPage, charLookup, API,
  };
})(typeof window !== 'undefined' ? window : globalThis);
