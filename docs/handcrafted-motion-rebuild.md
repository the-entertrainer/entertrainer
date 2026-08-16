# Handcrafted Whitespace and Motion Rebuild

## Audit findings

The current public site already has a strong paper-and-ink base, but its visual rhythm remains too uniform. The repeated `t-rise`, `t-fade-up`, editorial image entrance, and shared card treatment make unrelated sections behave as if they belong to one generic landing-page template. The pre-boot screen is legible but uses an endless sweep line, so it signals waiting rather than introducing the Entertrainer identity.

The main correction is not to add uncontrolled animation. Each public page needs one recognisable movement idea, stronger rests of whitespace between visual moments, and fewer equal-weight components competing inside a viewport. The reading system must remain instantly usable when animation is disabled.

## Page choreography

| Page family | White-space correction | Dominant motion idea | Visual treatment |
| --- | --- | --- | --- |
| Home | Increase breathing room between personal opening, visual field, routes, work, tools, and closing note. | The blue route thread appears as a guided path, then settles. | Human-systems art has a slow crop drift; route destinations receive distinct directional accents rather than matching card lifts. |
| Lessons | Separate the studio illustration from the two choices with a larger quiet gap. | Instruction lines draw into the short-lesson sheet; the AI route builds from a sequence of dots. | The choice panels do not rise as cards; their internal artifact reveals once. |
| Projects | Let the workbench image act as a threshold before the real covers. | A single thread traces across the workbench before project covers crossfade from paper to artefact. | Project image crops shift slightly in different directions on focus or hover. |
| Free tools | Reduce visual containment around rows and increase spacing between each tool. | Utility glyphs assemble in place, then remain static. | The toolkit visual has a controlled paper-slide entrance, while each action arrow gets brief forward feedback. |
| About | Preserve long reading rests around the personal photography. | A vertical path grows between story chapters only as the reader reaches the next chapter. | Photography uses a soft clip reveal rather than a generic fade-up. |
| Preloader | Remove the looping progress sweep. | The five-bar signal is drawn in order, the wordmark is written in, then a route line completes before the app takes over. | One 900ms finite sequence; it never loops and ends in a stable brand mark. |

## Shared motion system

The updated system will retain the existing duration scale but add named choreography primitives: `ink-write`, `route-trace`, `paper-reveal`, `chapter-path`, `artifact-shift`, and `signal-draw`. All use transform, opacity, clip-path, SVG stroke dash offset, or background-position where appropriate. They are one-time and finite. Repeated motion, scroll-hidden essential content, card elevation, decorative spinning, and looping gradients are prohibited.

## Reduced motion and performance

Under `prefers-reduced-motion: reduce`, every nonessential motion resolves to the final static state. Static content remains visible without a script or observer. Any scroll-linked chapter path is only decorative; content is never gated by it. Visual assets use existing stable CDN URLs and `loading` choices based on whether they appear in the first viewport.

## Mobile visual checks

At `375 × 812`, the homepage keeps a calm mobile masthead, a clear personal opener, an oversized but readable promise, breathing room between the purpose statement and the primary lesson action, and the opening editorial visual without clipping. The Lessons page retains a distinct written-title treatment in its settled state, a readable three-line description, a cropped instruction-studio visual with the blue route visible, and a plain instruction-sheet choice artifact that begins below it.

The About page opens cleanly on mobile with Naveen’s name, a direct introduction, the personal story heading, the new chapter-route illustration, and the first authentic hospitality image. A forced reduced-motion homepage capture confirms that the masthead, personal promise, supporting copy, primary action, and artwork resolve immediately into a complete readable page without relying on entrance movement.

The final browser-console check contained only Nuxt’s existing Suspense informational notice and no client-side error from the handcrafted preloader, world field, route choreography, page-family title motion, or project-card interaction response.
