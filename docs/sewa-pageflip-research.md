# SEWA Reader: Open-Source Page-Flip Research

## Repositories inspected

Two external repositories were downloaded into `/home/ubuntu/sewa-pageflip-research/` and inspected as source-only references. They were not executed.

| Repository | What was learned | Decision |
|---|---|---|
| [Nodlik/StPageFlip](https://github.com/Nodlik/StPageFlip) | A dependency-free engine with real corner dragging, touch support, physical shadows, hard covers, portrait and landscape modes, plus image and HTML page inputs. The documentation notes that portrait HTML mode clones pages. | Use its image-backed page model. It preserves the physical flip while avoiding cloned live text during narrow-screen turns. |
| [blasten/turn.js](https://github.com/blasten/turn.js) | A mature visual reference for magazine-style folding, but it depends on jQuery and its own README describes an older browser support baseline and non-commercial BSD licence. | Do not adopt. It adds an incompatible dependency and does not improve the reader’s accessibility model. |

## Reader model

The SEWA reader will use StPageFlip with pre-rendered page artwork for the visual book. Narrative pages are drawn to publication-specific canvas artwork; original SEWA comic pages are retained as image pages. This makes every visual surface a true physical page during the turn. The same page’s structured title, text, alternative text, and status remain in an assistive-technology-only reading layer.

## Type system

The reader will not use the site-wide display pair. It uses **Bodoni Moda** for publication display lines, **Libre Baskerville** for reading copy, and **IBM Plex Mono** for folios and editorial notes. The fonts give the book a composed print rhythm while the original comic cover and pages retain their own illustrated lettering.

## Interaction and fallback

The visual reader supports page-corner drag, tap or click turns, swipe, keyboard left and right arrows, and an announced current page. Reduced-motion readers receive the same content in a static, structured reading page with direct keyboard navigation. No persistent visible previous or next controls appear in the visual book.
