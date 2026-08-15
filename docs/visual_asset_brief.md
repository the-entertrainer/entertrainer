# Visual asset brief — external generation handover

This is the commission for the one category of imagery the site genuinely
lacks. It is written to be pasted whole into an external agent (Manus or
similar) that will generate the artwork and return a zip.

## What is being commissioned, and what is not

**Commissioned — 19 images.** Nine pieces of card artwork and ten course
module openers. The card artwork is the only illustration on the site; the
course currently has 39 lessons and no imagery at all.

**Not commissioned, and the reasons matter:**

| Asset | Why not |
|---|---|
| `og-card.png`, favicons, PWA icons | Generated from design tokens by `scripts/build-og-card.mjs` and `favicon.svg`. They must stay in sync with the palette; a hand-supplied file would drift the first time a colour changes. |
| The four tool icons (192/512) | Icons at 192px are geometry, not illustration. Generative models are unreliable at that size and these need to survive maskable-icon cropping. |
| `public/work/sewa/*.webp` | Real pages from a real project, authored by Naveen Jose. Replacing portfolio evidence with generated imagery would misrepresent the work. |
| `public/about/*.webp`, `naveen.jpeg` | Photographs of a real person and real places. |
| `backdrop-*.png` (4 files) | Referenced nowhere in source. Orphans — to be deleted, not regenerated. |
| `templates/frameworks/resources/downloads.png` | Those pages render `UiConstructionZone`; there is no layout to art-direct yet. |
| The typographic covers themselves | The eyebrow, hairlines, pull-quote and colophon are set programmatically from the fonts' own metrics. Artwork drops *into* that frame — see below. |

## The key structural decision

**The generator supplies artwork, not finished covers.**

Every piece of type on these images is set by `scripts/build-thumbnails.mjs`
from real font metrics. The incoming PNG is composited into the existing
frame. This is deliberate: text rendering is the least reliable thing a
generative image model does, and this arrangement means it never has to.

Consequence: any image containing letterforms is rejected on arrival.

## Code change required on receipt

The course has 18 block types and none of them is an image
(`content/course/ai/types.ts`). Placing the module openers means adding a
block variant and a renderer in `components/course/`. That is a change to
make when the assets land, not before — a content type nobody can draw
should not be authorable.

---

## The prompt

Everything below the line is the handover, self-contained for an agent with
no access to this repository.

---

You are producing a set of editorial illustrations for **Entertrainer**, the
portfolio and publication of Naveen Jose, an instructional designer. The site
is a typographic editorial publication: strict palette, flat surfaces, 1px
hairlines, 3px corner radii, no shadows, no gradients anywhere in the
interface. The illustrations must belong to that world.

Deliver a single **zip file** with the structure specified at the end.

### Absolute constraints

These are rejection criteria, not preferences. An image that breaks any of
them is unusable.

1. **No text of any kind.** No letters, no words, no numbers, no digits on
   dials, no labelled axes, no signage, no glyphs that read as language in
   any script. All type is set separately in code. This is the single most
   important constraint.
2. **No logos, brand marks, trade dress, or recognisable products.** No
   depiction of any real company's identity, including hospitality brands,
   any phone or laptop that is identifiably a specific product, or any
   software UI that reproduces a real application.
3. **No identifiable people.** No faces, no portraits, no likenesses. Human
   presence, where needed, is figures at a distance, silhouettes, hands, or
   implied by objects.
4. **No gradients, no drop shadows, no bevels, no glows, no 3D renders, no
   photorealism, no glossy or "AI-looking" surfaces.** Flat fills only.
5. **No traced, upscaled, or style-transferred third-party artwork.** Every
   output must be an original generation.

### Palette

Flat fills only, drawn from this set. Each image uses **exactly one accent**
— the one named in its entry — plus that accent's tint, ink, paper, and at
most one grey. Antialiasing at shape edges is the only permitted deviation.

| Role | Hex |
|---|---|
| Paper (background) | `#FFFFFF` |
| Ink | `#161618` |
| Grey (optional, one only) | `#737379` |
| Blue accent | `#2C2BE8` — tint `#D5D5FA` |
| Red accent | `#E02D18` — tint `#F9D5D1` |
| Green accent | `#1FD07A` — tint `#D2F6E4` |
| Purple accent | `#8B34D4` — tint `#E8D6F6` |
| Yellow accent | `#F2DC2E` — tint `#FCF8D5` |
| Cyan accent | `#22B8D8` — tint `#D3F1F7` |

The one-accent-per-image rule is what makes nineteen separate illustrations
read as one publication. Do not mix accents within a single image.

### Register

Flat editorial illustration in the tradition of printed magazine and
screenprint work: hard edges, confident shapes, limited ink. Think risograph
or two-colour offset — flat areas of colour, shapes that overlap and knock
out, generous white space. Geometric and diagrammatic rather than painterly.

Every image must still read at **380 pixels wide**, which is the size it
appears at on the site. Test this. Fine hatching, small detail, thin lines
under about 4px at full size, and busy compositions all disappear at card
size and are the most common failure here. Fewer, larger shapes.

### Technical specification

- **Dimensions: exactly 1672 × 941 px** for every image. No exceptions, no
  other aspect ratios.
- **Format:** PNG, 8-bit, sRGB.
- **Background:** opaque `#FFFFFF`, filling the full canvas.
- Keep the outer **100px** of every edge visually quiet — no critical
  subject matter there. The composition is centred; the outer band may be
  cropped when composited.

### The nine card artworks

Each fronts a specific piece of writing or a specific web app. The subject
brief is what the piece is actually about — illustrate the idea, not the
title.

| File | Accent | The idea to illustrate |
|---|---|---|
| `covers/instructional-design.png` | Blue `#2C2BE8` | Instructional design as **removal**. A subject expert already knows the thing; the work is turning that into something another person can learn, and most of that work is subtraction. Something dense and cluttered being reduced to something few and clear. |
| `covers/work-01.png` | Red `#E02D18` | A **printed comic** teaching service values through true stories from a resort floor. Comic-strip panel grids, speech balloons *left empty*, hospitality objects — luggage, keys, a bell, a corridor. No hotel brand of any kind. |
| `covers/strong.png` | Red `#E02D18` | **Password strength as time.** The same password takes a second or a century to crack depending entirely on who is doing the cracking. Vast disparity of scale; combinatorial explosion; one tiny interval against an enormous one. |
| `covers/ai-course-cover.png` | Red `#E02D18` | **The history of AI as a curve with two collapses in it.** Rising expectation, two deep troughs, a rise again. Evidence versus announcement. Abstract, not a chart with labels. |
| `covers/about-me.png` | Purple `#8B34D4` | **A route with five stops**, from hotel floors to learning design. A path or journey through five marked points; hospitality at one end, teaching at the other. No faces. |
| `covers/storygen.png` | Green `#1FD07A` | **Storyboarding on an infinite canvas.** Rectangular cards scattered across an open plane, joined by connector lines, extending past the frame to imply the canvas has no edge. |
| `covers/training-cal-gen.png` | Green `#1FD07A` | **A list becoming a calendar.** A vertical stack of items on one side resolving into a regular month grid on the other. Transformation from linear to gridded. |
| `covers/easymcq.png` | Green `#1FD07A` | **One right answer generating plausible wrong ones.** A single marked option and several unmarked siblings that look equally credible. Multiple-choice structure without any text. |
| `covers/better-emails.png` | Green `#1FD07A` | **Messy draft in, sendable message out.** A tangle resolving into clean parallel lines. Chaos to order, left to right. |

### The ten course module openers

These head the modules of a free one-day course on the history of artificial
intelligence. They are **openers, not teaching diagrams** — they set tone at
the top of a module. They may be diagrammatic in spirit, but carry no labels
and no explanatory burden.

All ten use the **red accent `#E02D18`**, because the course sits in the
Projects section and the section colour has to hold across the set.

| File | Module | The idea |
|---|---|---|
| `course/m01.png` | What we are actually talking about | Definitions and nesting — one set inside another inside another. |
| `course/m02.png` | Before there was a field | Early mechanical computation and formal logic. Punched cards, tape, switches, symbolic notation reduced to abstract marks. |
| `course/m03.png` | Rules, search and expert systems | Branching decision trees; explicit chains of if-then; a search spreading through a tree. |
| `course/m04.png` | The winters | Collapse. Funding and confidence falling away; two distinct troughs; something frozen or arrested. |
| `course/m05.png` | Learning from data | Scattered points with a boundary or line fitted through them. Pattern emerging from a cloud. |
| `course/m06.png` | Neural networks | Layered nodes joined by edges. Simple, clean, not a hairball. |
| `course/m07.png` | The deep learning decade | Depth and scale — many stacked layers, quantity as the story. |
| `course/m08.png` | Transformers and language models | Attention: elements in a sequence connecting to other distant elements, weighted, all at once rather than in order. |
| `course/m09.png` | Generative, multimodal, agentic, embodied | Four distinct modes converging into one system. Different kinds of input and output meeting. |
| `course/m10.png` | Risk, evidence and the frontier | A boundary or horizon; the difference between what is established and what is merely announced. Two sides of a line. |

### Also include: a contact sheet

`contact-sheet.png` — all nineteen images laid out in a grid at thumbnail
size on a white background, in the order listed above. This is the review
artefact: the set has to look like one publication, not nineteen unrelated
pictures. If the contact sheet does not cohere, revise before delivering.

### Provenance and licensing

Include `PROVENANCE.md` stating, honestly and specifically:

- The exact tool, model and version used to generate the images.
- That the generator's terms of service permit commercial use of the outputs,
  with a link to those terms.
- That every image is an original generation containing no third-party
  logos, characters, trade dress, or likenesses of real people.
- That nothing was traced, upscaled, or style-transferred from existing
  artwork.

Do **not** apply a CC0, public-domain, or open-licence label to any file.
Generated imagery has a genuinely unsettled licensing position; state what
was done and under whose terms, and let it be recorded accurately rather
than given a label that sounds clean. Any file whose provenance cannot be
stated plainly should be left out of the delivery.

Include `manifest.json`:

```json
{
  "generated": "2026-08-15",
  "generator": { "tool": "", "model": "", "version": "" },
  "assets": [
    {
      "file": "covers/strong.png",
      "accent": "#E02D18",
      "width": 1672,
      "height": 941,
      "prompt": "the full prompt used for this image",
      "seed": "if available",
      "revisions": 0
    }
  ]
}
```

### Self-check before delivering

Verify every one of these and state the result in `PROVENANCE.md`:

1. Every file is exactly 1672 × 941.
2. No image contains any letter, number, or language-like glyph.
3. Each image uses only its assigned accent, that accent's tint, `#161618`,
   `#FFFFFF`, and at most `#737379`.
4. No gradients, shadows, or 3D shading are present.
5. Every image is still legible when viewed at 380px wide.
6. The contact sheet reads as a single coherent set.

### Deliverable

One zip named `entertrainer-visuals.zip`:

```
entertrainer-visuals/
  manifest.json
  PROVENANCE.md
  contact-sheet.png
  covers/
    instructional-design.png
    work-01.png
    strong.png
    ai-course-cover.png
    about-me.png
    storygen.png
    training-cal-gen.png
    easymcq.png
    better-emails.png
  course/
    m01.png  m02.png  m03.png  m04.png  m05.png
    m06.png  m07.png  m08.png  m09.png  m10.png
```
