# Stitch

Offline PDF combiner for Entertrainer's Empower collection. `/tools/stitch` opens the standalone workspace at `/stitch/`. The dedicated service-worker scope keeps it independent from the Nuxt shell and its deployment cache.

## Development

From the repository root, run `python -m http.server 4173 --directory public` and open `http://localhost:4173/stitch/`. HTTPS or localhost is required for service workers. No CDN, API key, upload service, or runtime package installation is needed.

Run `node --test tests/stitch/*.test.mjs` for real PDF-worker and offline cache contract checks; `npm run build` checks the Nuxt integration. The worker harness uses Node's worker threads, not browser automation. Browser installation, responsive rendering, and a real browser's offline navigation still need browser acceptance testing.

## Behaviour

- Import multiple PDFs or a folder, natural sort, search, reorder by drag/buttons/position, and paginate long stacks.
- Choose page ranges, reversed ranges or repeated pages; rotate selected pages relative to their original orientation.
- Inspect and merge in workers. Cancellation terminates the merge worker. The queue is locked during inspection and merging.
- Stop on unreadable/encrypted PDFs by default. Optional skip mode reports every omitted file before the explicit download.
- Source limits: 512 MB total and 2,000 files. Output is still constrained by available browser memory. Files are session-only and never cached or uploaded.
- Offline assets are cached atomically on first successful online visit. “Offline ready” requires the Stitch worker to activate. Browser storage eviction may require another online visit.
- Copying pages preserves page content; document-level bookmarks, attachments, signatures and interactive form behaviour are outside this tool's scope.

## Dependencies and updates

`vendor/pdf-lib.min.js` is the unmodified browser distribution of the repository's locked `pdf-lib` version (1.17.1), accompanied by its MIT licence. Refresh from `node_modules/pdf-lib/dist/pdf-lib.min.js` after an intentional dependency update. Font files reuse the site's existing self-hosted, licensed fonts.

Bump `VERSION` in `sw.js` whenever any cached file changes. Only Stitch-prefixed old caches are removed. The main site's caches are not deleted. The existing Vercel deployment serves the static files; no separate hosting service is required.
