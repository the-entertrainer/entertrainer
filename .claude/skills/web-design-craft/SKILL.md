---
name: web-design-craft
description: Use before shipping any visual or interactive UI — home pages, card layouts, hero sections, nav chrome, hover/motion feedback — to judge and improve it against grounded design principles instead of decorating by instinct. Especially useful when a surface feels "cluttered," "flat," or "not quite right" and the fix needs to be a subtraction, not an addition.
---

# Web design craft

Distilled from three credible, widely-cited sources (see Sources) into rules that are actually checkable against a screenshot or a running page — not vibes.

## The one-sentence thesis

**Design is mostly subtraction.** Every additional element — a nav bar, a badge, a button, a shadow, a second accent color — has to justify its presence against the cost of competing for attention with everything already there. When a surface feels wrong, the fix is almost always "remove something," rarely "add something to fix it."

## Checklist, in the order to actually apply it

### 1. What is this screen *for*, and does everything on it serve that?

Name the one job the screen does. Then look at every element and ask if it does that job. If a nav bar's job is already done by the content (e.g., clickable cards that *are* the navigation), the nav bar is redundant chrome, not a safety net — cut it, don't shrink it.

- **Hick's Law**: more choices visible at once → slower decisions. A page offering "4 nav links + 4 cards that do the same thing" is offering the same choice twice.
- **Von Restorff Effect**: the one thing that should stand out only stands out if nothing else is competing for the same attention.

### 2. Whitespace first, decoration last

Refactoring UI's practical rule: start with **too much** whitespace, then remove it until the layout feels tight but not cramped. Never start cramped and try to add breathing room back with borders/dividers — dividers are a patch for missing space, not a substitute for it.

- Grouped things need less space between them; ungrouped things need more. If two elements are 8px apart and unrelated, the eye reads them as related whether you meant that or not (**Law of Proximity**).
- A shared background tint or border around a set of elements reads as "these belong together" even with generous internal padding (**Law of Common Region**) — prefer this over tight spacing when you need grouping *and* breathing room.

### 3. One hierarchy, established by size + weight + color — not by adding UI

Every screen should have an obvious single answer to "what do I look at first." That's built from type scale and contrast, not from adding arrows, badges, or "look here" chrome.

- Constrain your type scale (a handful of sizes, not a continuum) and your spacing scale (a handful of steps, not arbitrary pixel values). Constraint is what makes a page look designed rather than assembled.
- Design the hierarchy in grayscale before touching color. If it doesn't read without color, color is doing load-bearing work it shouldn't have to do.

### 4. Motion and feedback are information, not flourish

A hover/press state exists to answer "did the system notice me, and what will happen if I commit." If it doesn't answer one of those, cut it.

- **Doherty Threshold**: keep perceived response under ~400ms. A hover cue that fades in over half a second reads as sluggish, not elegant.
- Feedback should be proportional to the action: a hover on a card that's about to be clicked deserves a small, immediate cue (cursor change, a few percent of scale/lift) — not a large animation that argues for attention it hasn't earned yet (this is also where restraint pays off: the correct amount of hover feedback is usually *less* than the first draft).
- If an interactive surface's only affordance is "you'll find out when you click it," add the cheapest possible cue first: cursor semantics (`pointer` over what's clickable, `grab`/`grabbing` over what's draggable). It costs nothing visually and answers "can I act here" before the user commits.

### 5. Consistency beats novelty for anything load-bearing

**Jakob's Law**: users spend most of their time on *other* sites, and bring those expectations with them. A hamburger icon means "menu" everywhere; a stack of cards that flips on drag needs its own affordance taught once (a hint label), not reinvented per page. Novelty is a budget — spend it on the one thing that's actually the point of the page, not on the chrome around it.

### 6. Accessibility is part of the craft, not a tax on it

A visually minimal surface (e.g., a canvas-only interactive stage with no visible nav) still needs real, crawlable, keyboard-reachable links in the DOM for anyone without a pointer, without JS, or indexing the page for search. Visually-hidden (`sr-only`) markup — present in the DOM, invisible on screen — lets a design be *visually* card-only while remaining *functionally* complete. "Only cards, visually" and "only cards, structurally" are different constraints; satisfy both, don't trade one for the other.

## Fast self-audit before calling something done

1. Screenshot it. Cover the bottom half — does the top half alone make sense? Cover the top — same question.
2. Count the distinct interactive affordances on screen. If the number surprises you, it's too high.
3. Would removing the least-important element make the page worse? If not, remove it.
4. Is there exactly one thing a first-time visitor's eye lands on in the first second? If two things tie, hierarchy hasn't been established.
5. Hover/press every interactive element once. If nothing visibly responds within ~400ms, feedback is missing, not subtle.

## Sources

- [Laws of UX](https://lawsofux.com/) — Jakob's Law, Hick's Law, Von Restorff Effect, Doherty Threshold, Law of Proximity, Law of Common Region, and the rest of the named laws referenced above.
- [Top 20 Key Points from *Refactoring UI* (Adam Wathan & Steve Schoger)](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802) — whitespace-first layout, design-in-grayscale-first, constrained scales, restrained color and shadow use.
- [robinstickel/awesome-design-principles](https://github.com/robinstickel/awesome-design-principles) — curated index of design-principle collections (Design Principles FTW, Apple HIG, Material Design, IBM Carbon, Shopify Polaris, GOV.UK) used to cross-check that the rules above aren't idiosyncratic to one source.
