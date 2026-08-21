# WCAG 2.2 Accessibility Audit

## Baseline and scope

This audit uses **WCAG 2.2 Level AA** as its working conformance target. WCAG 2.2 is a W3C Recommendation and is the latest WCAG 2 standard; W3C recommends using the latest version. Content that conforms to WCAG 2.2 also conforms to WCAG 2.1 and WCAG 2.0.[^wcag22] [^overview]

The audit follows the five-part structure in WCAG-EM 2.0: define scope, explore the product, select representative views, evaluate, and report. It covers the public site, shared shell, interactive tools, and both immersive course players. It is a code, browser, and keyboard review; it does **not** substitute for testing with people with disabilities or every assistive-technology/browser combination.[^wcagem]

## Audit scaffolding

| Level | Evidence gathered | Focus |
|---|---|---|
| 1. Static source | Semantic markup, accessible names, heading levels, landmark use, `aria-*`, image alternatives, focus styles, motion settings | Deterministic structural defects |
| 2. Automated browser | axe-style rule coverage, interactive-element geometry, computed contrast, duplicate IDs, DOM state after route changes | Repeatable, programmatically detectable defects |
| 3. Keyboard flows | Tab order, visible focus, skip link, menu, course navigation, choices, hints, forms, dialogs, and route changes | Operability and focus management |
| 4. Responsive and motion | 320 CSS px reflow, target size, focus visibility, no pointer-only operation, reduced motion, loader handoff | WCAG 2.1 and 2.2 interaction requirements |
| 5. Human copy review | Labels, error/help language, visible instructions, status messages, repeated boilerplate, and instructional vocabulary | Understandability and content quality |

## Required evidence before any conformance conclusion

No page or site-wide "WCAG compliant" claim will be made from automated checks alone. A final statement will distinguish:

1. **Verified pass**: sampled and tested against a named success criterion.
2. **Remediated and rechecked**: an issue was found, corrected, and retested.
3. **Needs specialist or user testing**: assistive-technology, caption quality, cognitive usability, or third-party embedded-media behaviour not fully verifiable in this environment.

## Findings and remediation log

| Audit level | Finding | WCAG 2.2 relevance | Action taken | Status |
|---|---|---|---|---|
| Document structure | The root document had no programmatic language. | 3.1.1 Language of Page | Added `lang="en"` through the Nuxt document head. | Remediated; requires final browser recheck. |
| Keyboard bypass | The public skip link changed the URL fragment but did not move focus to the main landmark. | 2.4.1 Bypass Blocks | Made the shared public `main` target programmatically focusable with `tabindex="-1"`. | Remediated; requires final keyboard recheck. |
| Focus appearance | The shared focus outline was only 2 CSS pixels and custom fields suppressed the default outline. | 2.4.7 Focus Visible, 2.4.13 Focus Appearance | Increased the shared outline to 3 CSS pixels with a 3-pixel offset and retained a visible field focus treatment. | Remediated; requires final contrast recheck. |
| Target size | Course navigation controls were 27 by 27 CSS pixels; footer and tool links were also sampled below the preferred 24-pixel height. | 2.5.8 Target Size (Minimum) | Increased course controls to 44 by 44 CSS pixels and shared footer link targets to at least 28 CSS pixels. Inline-text exceptions are documented for remaining inline privacy links. | Remediated in shared components; tool-specific samples require final review. |
| Progress and state | Course progress was visual text only, and several selected learning choices exposed no pressed state or announced feedback. | 4.1.2 Name, Role, Value; 4.1.3 Status Messages | Added progressbar values, `aria-pressed` to sampled AI and Instructional Design activity choices, and polite status announcements for activity feedback. | Remediated; requires screen-reader verification. |
| Tab interaction | ADDIE tabs lacked roving keyboard navigation and panel relationships. | 2.1.1 Keyboard; 4.1.2 Name, Role, Value | Added tab IDs, controls, active tab stop, arrow/home/end handling, and a labelled tabpanel. | Remediated; requires final keyboard recheck. |
| Tool feedback | EasyMCQ and Draftly loading/errors did not consistently expose status changes. | 4.1.3 Status Messages | Added polite loading status and alert roles for errors; simplified generic loading text. | Remediated; requires final live-state test. |
| Tool labels | Glass Lab’s settings control exposed no state, its canvas had no text alternative, and its configuration output had no label. | 1.1.1 Non-text Content; 4.1.2 Name, Role, Value | Added a canvas alternative, disclosure state, settings association, selected-state exposure, and a configuration label/status. | Remediated; requires final keyboard test. |
| Modal behaviour | The SEWA lightbox moved focus on open and close but did not trap Tab inside the modal. | 2.1.2 No Keyboard Trap; 2.4.3 Focus Order | Added a cycle for forward and reverse Tab navigation within the dialog. | Remediated; requires final keyboard test. |
| Motion | Theme transitions continued when reduced motion was requested. | 2.3.3 Animation from Interactions | Disabled global theme transitions in the reduced-motion media query. | Remediated; requires OS-preference test. |
| Contrast sample | Core light-theme pairs measured 18.07:1 for ink on paper, 7.39:1 for muted text on paper, and 8.02:1 for blue on paper. Ink on blue measured 2.25:1 and is not used for normal text in sampled controls. | 1.4.3 Contrast (Minimum) | Recorded as a sampled pass, not a full-page color-pair proof. | Partially verified. |

## Automated-tool limitation

The axe-core command line scan initially identified the missing document language. Its browser-driver run then failed because the available scanner/driver combination did not remain compatible with the sandbox Chromium build. The findings above therefore combine source inspection, live DOM checks, keyboard operation, computed target geometry, and sampled contrast. This is a limitation of the audit environment, not evidence of a full automated pass.

## Remaining conformance risks requiring manual or specialist testing

1. **Screen readers**: Test the course feedback, generated-tool status, modal close cycle, and route-change heading focus with NVDA plus Firefox and VoiceOver plus Safari.
2. **Mobile reflow and targets**: Test at 320 CSS pixels and with device zoom in Safari and Chrome, including the mobile masthead and course control bar.
3. **Third-party video**: Verify captions, transcript availability, player keyboard behaviour, and title quality for embedded YouTube evidence videos. The local shell cannot control all third-party player behaviour.
4. **Full contrast sweep**: Inspect every state in both themes, including disabled, selected, error, focus, visited, overlay, and image-caption states with a dedicated contrast analyzer.
5. **Authentic user testing**: Include keyboard-only users, screen-reader users, low-vision users, and learners with cognitive-access needs before any public claim of WCAG 2.2 AA conformance.

## Revalidation evidence

| Check | Result |
|---|---|
| Document language | Live DOM returned `lang="en"`. |
| Skip link | Keyboard activation moved focus to `main` and updated the fragment to `#main`. |
| Focus appearance | The computed shared focus outline is 3 CSS pixels. |
| Course navigation | Live Back and Continue controls measured 52 by 44 and 70 by 44 CSS pixels. |
| Course progress | Live course progress exposed minimum `0`, maximum `100`, and current value. |
| ADDIE tabs | Arrow-right changed the active tab to Design; the selected tab had `tabindex="0"`, the remaining tabs had `tabindex="-1"`, and the panel relationship updated correctly. |
| Build and policy guard | `npm run check:paper-signal` passed before a successful lower-memory Nuxt production build. |

## Audit conclusion

This review found and remediated multiple clear WCAG-related defects. It provides evidence of **meaningful accessibility improvement**, not a declaration that the entire website conforms to WCAG 2.2 AA. The remaining risks above require additional manual testing, assistive-technology testing, and a full state-by-state contrast review.

[^wcag22]: [W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*](https://www.w3.org/TR/WCAG22/).
[^overview]: [W3C WAI, *WCAG 2 Overview*](https://www.w3.org/WAI/standards-guidelines/wcag/).
[^wcagem]: [W3C WAI, *WCAG Evaluation Methodology (WCAG-EM) 2.0*](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/).
