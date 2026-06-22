# Website Polish Plan

A phased audit-and-fix program to take the site from "overhaul landed" to
"shipped-polished". Each phase is self-contained, committed separately, and
verifiable. Phases are ordered so foundational cleanup unblocks the cosmetic
passes that follow.

---

## Audit findings (baseline)

The GUI overhaul (single top-left **E-button**: three bars that form an E
during the preloader, fly to the corner, and become the only menu trigger)
is **functionally complete and committed**. Auditing the rest of the site
surfaced the following:

| # | Finding | Impact |
|---|---------|--------|
| F1 | 5 dead components still on disk (`Logo`, `SoundButton`, `BackButton`, `ThemeCircle`, `ThemeToggle`) — unmounted after the overhaul | Confusion, dead weight |
| F2 | ~270 lines of dead CSS in `main.css` (`.logo-wrapper`, `.sound-button`, old `.menu*` system) | Maintenance hazard |
| F3 | `.detail-page` / `.detail-title` / `.detail-desc` / `.detail-content` CSS duplicated **verbatim** in 3 slug pages (about, tools, downloads) | Drift risk |
| F4 | Inner-page top padding inconsistent: `120rem` (slug pages) vs `100rem` (distractor-gen, id-page, rage-mail); none reserve space for the top-left E-button | Title can sit under the button |
| F5 | Chrome offset/size/z-index are scattered magic numbers (`18rem`, `20rem`, `48rem`, `z-index 20/30/40`) with no tokens | Hard to keep aligned |
| F6 | No shared type scale — headings range `24rem → 36rem → clamp(60,120)` ad hoc across pages | Visual inconsistency |
| F7 | Button conventions differ (`id-btn` 100rem radius, `dg-submit` full radius, varying padding/font) | Inconsistent CTAs |
| F8 | E-button tap target is 48rem but bars only span 22rem; X-close alignment + contrast-on-any-bg unverified | Touch ergonomics |

---

### Progress

- [x] **Phase 1** — dead chrome removed, chrome/z-index tokens added
- [x] **Phase 2** — E-button bar contrast fixed, seamless loader handoff
- [x] **Phase 3** — reduced-motion paths (loader + menu)
- [x] **Phase 4** — detail-page shell consolidated, inner-page padding unified
- [ ] **Phase 5** — button & control system
- [ ] **Phase 6** — typography & spacing scale
- [ ] **Phase 7** — responsive & safe-area sweep
- [ ] **Phase 8** — final QA

---

## Phase 1 — Remove dead chrome & establish chrome tokens  *(foundational)*

**Goal:** delete everything the overhaul orphaned, and replace scattered
corner-chrome magic numbers with named tokens.

- Delete `Logo.vue`, `SoundButton.vue`, `BackButton.vue`, `ThemeCircle.vue`,
  `ThemeToggle.vue`.
- Strip the dead CSS blocks from `main.css` (logo, sound-button, old menu).
- Add tokens in `:root`:
  - `--chrome-offset` (corner inset), `--chrome-size` (button box)
  - `--z-canvas`, `--z-chrome`, `--z-menu`, `--z-loader` layer scale
- Repoint `Menu.vue` + `Loader.vue` to the tokens so the E-button and the
  loader landing target are guaranteed identical.

**Verify:** build clean, no references to deleted components, E-button still
renders top-left.

## Phase 2 — E-button & menu panel polish

- Bar geometry: confirm the closed state reads as **E** (full / short / full);
  tune widths and stroke for crispness at 1×/2×.
- Tap target: keep the visible bars at 22rem but ensure the hit area fills the
  full `--chrome-size`.
- Open state: pixel-align the X (the two outer bars must cross at the button
  center); verify the middle bar fully vanishes.
- Panel: normalize item rhythm — back, links, theme toggle, sound toggle —
  with one spacing scale and one font ramp; align left edges.
- Contrast: the white pill must read on both dark and light themes and over
  the WebGL canvas.

## Phase 3 — Loader polish

- Tune the three-bar assemble → hold → fly timing and easing.
- Land the bars exactly on the real button (token-shared anchor from Phase 1).
- Add a `prefers-reduced-motion` path (fade-in, no fly).

## Phase 4 — Page layout consistency

- Promote the duplicated `.detail-*` styles into `main.css` once; delete the
  three scoped copies (F3).
- Standardize inner-page top padding via a `--page-top` token that clears the
  E-button on every page (F4).
- Unify `detail-title` / `detail-desc` and the inner-page headings against the
  Phase 6 type scale.

## Phase 5 — Button & control system

- One pill spec (radius, padding, font-size, active transform) applied to
  `id-btn`, `dg-submit`, `view-pill`, and menu controls (F7).
- Consistent focus/hover/disabled states; verify keyboard focus visibility.

## Phase 6 — Typography & spacing scale

- Define a small type scale (e.g. display / h1 / h2 / body / label / micro)
  and a spacing scale; apply across pages, replacing ad-hoc sizes (F6).

## Phase 7 — Responsive & safe-area sweep

- Walk every fixed/absolute element for `env(safe-area-inset-*)` coverage.
- Check each page at 360 / 768 / 1280 widths; fix overflow and cramped spots.

## Phase 8 — Final QA

- Theme toggle (dark/light) across every page.
- Spiral ↔ list, section drill-in/out, back navigation, sound toggle.
- Reduced-motion, 404 slug, and PWA shell.

---

*Execution order:* 1 → 4 are the highest-leverage (cleanup + structural
consistency); 5 → 8 are progressive cosmetic refinement. Each phase commits
independently so progress is reviewable and reversible.
