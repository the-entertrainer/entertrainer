(function (global) {
  const U = () => global.DialogueUtils;
  let db;

  function getDb() {
    if (db) return db;
    if (typeof Dexie === 'undefined') throw new Error('Dexie missing');
    db = new Dexie('dialogue-db');
    db.version(1).stores({
      projects: 'id, updatedAt, createdAt, title',
      pages: 'id, projectId, order',
      panels: 'id, pageId, order',
      nodes: 'id, panelId, pageId, type',
      assets: 'id, projectId, createdAt',
      meta: 'key',
    });
    // v2: AI Story Mode docs (outline, bible, generated pages)
    db.version(2).stores({
      projects: 'id, updatedAt, createdAt, title',
      pages: 'id, projectId, order',
      panels: 'id, pageId, order',
      nodes: 'id, panelId, pageId, type',
      assets: 'id, projectId, createdAt',
      meta: 'key',
      stories: 'id, updatedAt, createdAt, title, status',
    });
    return db;
  }

  async function getMeta(key, fallback) {
    const row = await getDb().meta.get(key);
    return row ? row.value : fallback;
  }
  async function setMeta(key, value) {
    await getDb().meta.put({ key, value });
  }

  function emptyProject(partial) {
    const id = U().uid('proj');
    const t = U().now();
    return Object.assign({
      id,
      title: 'Untitled',
      formatId: 'webtoon',
      width: 800,
      height: null,
      createdAt: t,
      updatedAt: t,
      coverAssetId: null,
      revision: 1,
    }, partial || {});
  }

  async function listProjects() {
    return getDb().projects.orderBy('updatedAt').reverse().toArray();
  }

  async function getProjectBundle(projectId) {
    const project = await getDb().projects.get(projectId);
    if (!project) return null;
    const pages = await getDb().pages.where('projectId').equals(projectId).sortBy('order');
    const panels = [];
    const nodes = [];
    for (const page of pages) {
      const ps = await getDb().panels.where('pageId').equals(page.id).sortBy('order');
      panels.push(...ps);
      for (const p of ps) {
        const ns = await getDb().nodes.where('panelId').equals(p.id).toArray();
        nodes.push(...ns);
      }
      const pageNodes = await getDb().nodes.where('pageId').equals(page.id).toArray();
      for (const n of pageNodes) if (!nodes.find((x) => x.id === n.id)) nodes.push(n);
    }
    const assets = await getDb().assets.where('projectId').equals(projectId).toArray();
    return { project, pages, panels, nodes, assets };
  }

  async function saveProjectBundle(bundle, opts) {
    const d = getDb();
    const project = bundle.project;
    project.updatedAt = U().now();
    project.revision = (project.revision || 0) + 1;
    await d.transaction('rw', d.projects, d.pages, d.panels, d.nodes, d.assets, async () => {
      await d.projects.put(project);
      if (opts && opts.replaceChildren) {
        const oldPages = await d.pages.where('projectId').equals(project.id).primaryKeys();
        for (const pid of oldPages) {
          const panelIds = await d.panels.where('pageId').equals(pid).primaryKeys();
          for (const panId of panelIds) await d.nodes.where('panelId').equals(panId).delete();
          await d.nodes.where('pageId').equals(pid).delete();
          await d.panels.where('pageId').equals(pid).delete();
        }
        await d.pages.where('projectId').equals(project.id).delete();
      }
      if (bundle.pages) await d.pages.bulkPut(bundle.pages);
      if (bundle.panels) await d.panels.bulkPut(bundle.panels);
      if (bundle.nodes) await d.nodes.bulkPut(bundle.nodes);
      if (bundle.assets) await d.assets.bulkPut(bundle.assets);
    });
    return project;
  }

  async function deleteProject(projectId) {
    const d = getDb();
    await d.transaction('rw', d.projects, d.pages, d.panels, d.nodes, d.assets, async () => {
      const pages = await d.pages.where('projectId').equals(projectId).toArray();
      for (const page of pages) {
        const panels = await d.panels.where('pageId').equals(page.id).toArray();
        for (const p of panels) await d.nodes.where('panelId').equals(p.id).delete();
        await d.nodes.where('pageId').equals(page.id).delete();
        await d.panels.where('pageId').equals(page.id).delete();
      }
      await d.pages.where('projectId').equals(projectId).delete();
      await d.assets.where('projectId').equals(projectId).delete();
      await d.projects.delete(projectId);
    });
  }

  async function duplicateProject(projectId) {
    const bundle = await getProjectBundle(projectId);
    if (!bundle) return null;
    const map = {};
    const nid = (old) => { map[old] = U().uid(old.split('_')[0] || 'id'); return map[old]; };
    const project = Object.assign({}, bundle.project, {
      id: nid(bundle.project.id),
      title: bundle.project.title + ' Copy',
      createdAt: U().now(),
      updatedAt: U().now(),
    });
    const pages = bundle.pages.map((p) => Object.assign({}, p, { id: nid(p.id), projectId: project.id }));
    const panels = bundle.panels.map((p) => Object.assign({}, p, { id: nid(p.id), pageId: map[p.pageId] }));
    const nodes = bundle.nodes.map((n) => Object.assign({}, n, {
      id: nid(n.id),
      panelId: n.panelId ? map[n.panelId] : null,
      pageId: n.pageId ? map[n.pageId] : null,
      assetId: n.assetId && map[n.assetId] ? map[n.assetId] : n.assetId,
    }));
    const assets = bundle.assets.map((a) => {
      const id = nid(a.id);
      return Object.assign({}, a, { id, projectId: project.id });
    });
    for (const n of nodes) {
      if (n.assetId && map[n.assetId]) n.assetId = map[n.assetId];
    }
    if (project.coverAssetId && map[project.coverAssetId]) project.coverAssetId = map[project.coverAssetId];
    await saveProjectBundle({ project, pages, panels, nodes, assets });
    return project;
  }

  async function putAsset(asset) {
    await getDb().assets.put(asset);
    return asset;
  }

  async function getAsset(id) {
    return getDb().assets.get(id);
  }

  function emptyStory(partial) {
    const id = U().uid('story');
    const t = U().now();
    return Object.assign({
      id,
      title: 'Untitled Story',
      status: 'draft', // draft | bible | pages | ready
      plot: '',
      tone: '',
      messages: [],
      outline: null,
      bible: null,
      pages: [],
      projectLinks: {}, // storyPageId -> dialogue projectId
      createdAt: t,
      updatedAt: t,
    }, partial || {});
  }

  async function listStories() {
    return getDb().stories.orderBy('updatedAt').reverse().toArray();
  }

  async function getStory(id) {
    return getDb().stories.get(id);
  }

  async function saveStory(story) {
    story.updatedAt = U().now();
    await getDb().stories.put(story);
    return story;
  }

  async function deleteStory(id) {
    await getDb().stories.delete(id);
  }

  async function resetAll() {
    await getDb().delete();
    db = null;
    getDb();
  }

  global.DialogueDB = {
    getDb, getMeta, setMeta, emptyProject, listProjects, getProjectBundle,
    saveProjectBundle, deleteProject, duplicateProject, putAsset, getAsset, resetAll,
    emptyStory, listStories, getStory, saveStory, deleteStory,
  };
})(typeof window !== 'undefined' ? window : globalThis);
