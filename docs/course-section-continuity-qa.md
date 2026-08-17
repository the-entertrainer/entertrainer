# Course Section Continuity — QA Notes

## Functional handoffs

The first **Introduction to Instructional Design** continuation control correctly unlocked the objectives section, scrolled it into view, and moved focus to `#objectives-title`. The released section received its dedicated `is-released` visual state while its existing next-section gate remained available.

The AI course’s **Continue to evidence and examples** control correctly released the second block of the historical-AI lesson, scrolled it into view, and moved focus to the evidence heading, “Modern AI is a chapter, not the opening page.” The released block received its dedicated `is-released` state while the third block stayed gated behind its own continuation control.

## Visual and accessibility behaviour

Both transitions use a brief vertical settle with staged child content. The target headings receive temporary programmatic focus with `tabindex="-1"`, leaving the document’s normal keyboard order intact. Each course includes a reduced-motion rule that removes the new section animations and uses immediate visibility with non-animated scrolling.
