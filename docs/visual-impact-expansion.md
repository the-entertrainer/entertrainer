# Visual Impact Expansion

## Decision rule

New imagery must either establish the subject of a destination, make a page transition more memorable, or add personal context that prose cannot carry. It must not repeat labels, contain text, imitate a UI screenshot, or serve merely as a coloured card background.

## Selected placements

| Location | Visual role | Asset approach | Why it earns its place |
|---|---|---|---|
| Homepage opening | Establish the feeling of a practical, human path through complex work | One wide editorial composition, placed beside the personal introduction | The first screen currently relies on type alone; one quiet visual gives the proposition a memorable setting without adding more copy. |
| Lessons | Distinguish the learning destination before the two lesson choices | One text-free instruction-studio banner | It signals making and trying, while the lesson cards continue to carry their own titles and commitments. |
| Projects | Give the archive a sense of material work before authentic project covers begin | One workbench-style editorial header image | It separates the archive introduction from the project evidence below without replacing the actual project covers. |
| Free tools | Signal that the route contains small useful browser utilities, not a product catalogue | One desktop-toolkit editorial header image | It provides a task-oriented visual entry before real tool covers and descriptions. |
| Homepage personal close | Add a small personal visual punctuation to the invitation | One restrained evening-desk or annotated-paper image | It makes the close feel authored without adding another CTA or meta label. |

## Deliberate non-placements

The About page will keep authentic hospitality and work photographs because real personal evidence is stronger than generated lifestyle imagery. Individual project pages will continue to use their own artefacts. The AI course already has a purpose-led visual system; it will not receive decorative site art. The footer and navigation remain text and signal mark only.

## Shared art direction

All five generated assets should be wide, text-free, print-like editorial compositions. They should use off-white paper, ink, the existing cobalt-blue signal, a small amount of violet, and one warmer human accent. The image should reserve visual breathing room and should not include interfaces, legible writing, logos, stock-photo posing, neon effects, glossy 3D, or heavy gradients.

## Motion system

The site will use existing duration and easing tokens, with no animation library added. Asset surfaces enter with one `18rem` upward translation and opacity transition at `420ms var(--ease-out)` only when a visitor opens a new public route. The default state remains fully visible so content never depends on animation or a viewport observer.

| Moment | Behaviour | Motion constraint |
|---|---|---|
| Editorial image on initial route load | One calm opacity and `translateY(18rem)` entrance | Runs once; never repeats on scroll. |
| Route image hover or keyboard focus | Image scales to `1.025` and the directional arrow translates `4rem` | Only on hover-capable devices; focus retains visible outline. |
| Primary action arrow | Arrow shifts `4rem` right on hover and focus-visible | Text and destination remain clear without motion. |
| Signal wordmark | Five bars receive a one-time 120ms staggered opacity/translation entrance | No looping pulse; brand remains static afterwards. |
| Reduced motion | All decorative asset, arrow, and signal movement becomes instant | No content is hidden; no transform transition runs. |

## Asset composition review

The Lessons studio image uses its central route, empty cards, and pencil as a calm visual explanation of learning in progress. The Tools toolkit carries its functional objects across the lower half of a large paper field. Collection-header images therefore use a taller desktop crop than the homepage visual strip so the illustrated objects remain visible rather than being reduced to empty paper. All reviewed images remain text-free and use HTML alternative text for their explanatory role.

## Responsive review

At `375 × 812`, the homepage keeps the wordmark, theme/menu controls, direct personal opening, readable purpose statement, and the primary lesson action in a clean sequence. The Lessons page keeps its direct title, one-sentence introduction, text-free studio illustration, and the short learning choice in a single-column flow with clear touch-sized controls.

The initial headless mobile captures show the external editorial image frames before their remote CDN images have decoded. The rendered browser checks confirm those images complete successfully at their stable CDN URLs. This is an expected capture-timing difference; the published assets use eager loading on the first viewport and retain a paper-colour surface during decode, so no layout shift or error state is exposed.

The Projects mobile capture preserves the direct title, one-sentence purpose, workbench frame, and content-first project card without author stamps or counters. The Free tools headless capture landed in the site’s normal pre-boot loading screen before hydration; the interactive browser check subsequently confirmed the loaded route and its published toolkit image. It is therefore excluded as evidence of the final Free tools layout.

## Final validation

All five visual placements use stable Manus CDN URLs, descriptive alternative text, and an off-white frame during decode. The home opening and closing images, Lessons studio, Projects workbench, and Free tools toolkit were verified in the live browser. Collection headers were given a taller desktop crop to preserve their illustrated objects; the Free tools screenshot confirms the calendar, envelope, planning card, pencil, and signal are visible rather than reduced to an empty paper field.

The reusable motion layer applies a one-time editorial-asset entry, small directional action feedback, and a five-bar wordmark entrance. It has no looping effects, no scroll-dependent hidden state, and a `prefers-reduced-motion` rule that disables all decorative transforms and transitions. The final production build completed client, server, PWA, Vercel static output, Nitro generation, and reported `Build complete!`.
