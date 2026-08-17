# Introduction to Instructional Design — Validation Notes

## Initial browser review — 17 August 2026

The rebuilt `/instructional-design` module loads successfully in Nuxt after moving course media to publicly accessible CDN URLs. The opening cover image is visible, the course header and section navigation are present, the stated learning objectives appear directly after the introduction, and the first knowledge check correctly updates both instructional feedback and the in-course progress indicator.

The opening review also confirmed that the learning sequence is reading as a single-column e-learning module rather than an article page: the café scenario appears before the definition, feedback is phrased as instructional explanation, and visual evidence is present next to explanatory content. Remaining checks cover the sorting interaction, the ADDIE stage selector, the objective activity, final matching and question logic, narrow mobile layout, source links, image delivery, and production build.

The first two sorting decisions were also tested. Each card accepts an independent selection, applies a high-contrast blue selected state, and preserves the task description, so the learner can compare choices before receiving the consolidated explanation after all four decisions are made.

The complete correct sort produces the intended explanation that training is only one part of performance support. The ADDIE visual sequence renders as a deterministic five-stage diagram, and selecting the Design tab updates the stage explanation, café example, and useful output. The objective-builder check also selects and explains the observable, contextualised objective correctly. The Creative Commons Bloom’s taxonomy source diagram loaded successfully under its attributed course caption.

The applied Friday-shift scenario gives the intended analysis-first explanation. The final matching check accepts the three correct pairings and confirms the relationship between Analyse, Design, and Evaluate. The selected final definition submits successfully, presents a concise completion explanation, and moves the module progress indicator to 100%.

## Responsive and delivery checks

A true 375-pixel Chrome capture confirms that the course header, lesson progress, mobile navigation, hero cover image, beginner label, headline, and opening explanation form a readable single-column composition. The cover image appears after normal CDN image decoding; the initial immediate capture merely preceded that external resource’s decode. The browser console contains no client-side errors (only Nuxt’s standard Suspense development notice). The three deployed course images and the credited Bloom’s taxonomy diagram returned HTTP 200. The authoritative source pages checked successfully except ATD, which returned a rate-limit response to the automated request rather than a missing page; its in-course source URL remains the canonical ATD glossary page.
