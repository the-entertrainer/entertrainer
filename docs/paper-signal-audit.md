# Paper Signal audit — baseline

**Scope:** Entertrainer public site and immersive learning routes.

## Visual-system finding

The current repository mixes photographic/editorial raster assets, external image URLs, generated illustrations, category-specific visual systems, and pictographic glyphs. This produces a fragmented visual authorship rather than a consistent portfolio system. The approved **Paper Signal** standard replaces all non-brand visual art with original graphics built from a pale blue field, white paper rectangle, thin black rules, soft blue offset sheet, and one cobalt signal.

## Asset inventory — first pass

| Area | Current visual pattern | Paper Signal action |
|---|---|---|
| Homepage | Route map raster image and moving tiles | Replace with a live Paper Signal map/route composition or original vector illustration. |
| Lesson and work indexes | Externally hosted editorial image fields and card artwork | Replace with standard Paper Signal category illustrations; retain only brand marks and necessary project evidence after review. |
| Courses | Photo, generated artwork, real-image evidence, course diagrams, video surfaces | Replace nonessential imagery with Paper Signal diagrams and illustrations; preserve embedded authoritative source video only where it has explicit learning value. |
| Project story pages | Covers, comic pages, and portfolio evidence | Treat case-study evidence separately from decorative art; retain only original work required to present the project, reframe its surrounding interface in Paper Signal. |
| Tool interfaces | Varied glyphs, status symbols, legacy visual marks | Replace pictographic state glyphs with text or Paper Signal line icons; keep functionality unchanged. |
| Shared UI | Arrows, check marks, status dots, and category accents | Replace glyph-first controls with consistent inline SVG or text labels, retaining accessible names. |

## Emoji and glyph baseline

The repository did not return Unicode emoji-codepoint matches in the initial scan. It does contain pictographic glyph candidates, including checkmarks, solid dots, stars, arrows, and decorative symbols. These are in scope for replacement when they function as visual interface elements. Plain language arrows embedded in source comments or URLs are not design output and do not require replacement.

## Information architecture baseline

The published sitemap contains the homepage, one instructional-design course, work index and project pages, an about page, tool index and tool pages, and a colophon. The intended public architecture is already concise; the issue is the homepage’s presentation hierarchy and visual duplication rather than a lack of navigable destinations.

| Sitemap evidence | Source |
|---|---|
| `/`, `/instructional-design`, `/my-work`, `/about`, `/tools`, individual tool routes, and `/colophon` | https://entertrainer.in/sitemap.xml |

## Similarweb baseline limitation

The requested Similarweb skill was reviewed and its data endpoints are available in principle. This Nuxt repository does not contain the sanctioned project-side data API helper required to make the call, and no verified Similarweb response has been retrieved. Therefore, this audit makes **no traffic, engagement, rank, or source-channel claim**. The information-architecture decision will use the verified sitemap, the live route structure, and a public content-depth review until valid traffic data is available.

## Content-depth finding

The public structure has dedicated destination pages for lessons, work, tools, personal story, and methodology. The highest-value change is not to add homepage content but to make the homepage a precise chooser and place detailed explanation in those destination pages. This supports the approved compact three-region homepage.

## Next audit actions

1. Run `npm run check:paper-signal` before each visual release. The check prohibits Unicode emoji and ordinary rendered image elements, with four explicit provenance-controlled exceptions: the AI and instructional-design players, homepage selected-work previews, and shared editorial cards. These locations may use only assets recorded in `docs/asset_licenses.md`, must retain meaningful alternative text, and use Paper Signal as framing or fallback rather than a decorative substitute.
2. Map course visuals by instructional function: orientation, explanation, practice, evidence, feedback, or removal.
3. Use Manim only where a time-based diagram improves understanding more than a static Paper Signal SVG.
