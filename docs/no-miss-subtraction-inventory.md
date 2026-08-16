# No-Miss Redesign: Subtraction Inventory

## Decision rule

This inventory applies the approved rule that every visible element must help a visitor **choose**, **understand**, **use**, or **feel** something specific about Entertrainer. Any element that does none of those jobs is removed. This is a planning inventory, not an implementation record; it defines what will be changed before the rebuild begins.

| Decision | Meaning |
|---|---|
| **Keep** | The element has a clear visitor purpose in its present general role. |
| **Simplify** | The purpose is valid, but the language, metadata, visual treatment, or repetition is excessive. |
| **Move** | The content is valuable but should not compete with a first-time visitor’s main journey. |
| **Remove** | The element is redundant, decorative, jargon-led, or duplicates an adjacent cue. |

## Shared site chrome and global patterns

| Surface or pattern | Current issue | Decision | Final rule |
|---|---|---|---|
| Five-bar Entertrainer signal and lower-case wordmark | Gives the site a recognizable starting point and derives from the preloader. | **Keep** | Use only in masthead, footer, preloader, favicon, and social identity contexts. |
| Masthead descriptor | “Making complicated things easier to learn” is useful but competes with the route labels at small widths. | **Simplify** | Retain as an optional quiet descriptor on wider screens; hide before primary navigation becomes crowded. |
| Primary navigation | “How this site works” is useful for curious visitors but is not a primary first-use decision. | **Move** | Main navigation: Lessons, Projects, Free tools, About. Move site-making notes to footer and About. |
| Current-edition line | Creates publication texture but does not help most visitors choose a path. | **Remove** from core pages | Keep only if a future Notes or journal page establishes a genuine dated-publication model. |
| Dark-mode control | Practical preference control. | **Keep** | Retain accessibly; never treat as a visual feature block. |
| Generic arrows on every card and row | Repeats the fact that an item is a link. | **Simplify** | Use a single consistent directional cue only where it improves scanability. |
| Repeated section eyebrows | Makes every section look mechanically generated. | **Simplify** | Use only when it adds a needed grouping or sequence; do not pair every heading with an eyebrow. |
| Repeated CTA pairs | Creates several competing “read/see/explore” decisions. | **Remove** where duplicated | One decision per section; cards themselves can be the action. |
| Scroll-reveal animation on normal reading blocks | Makes basic content feel staged. | **Remove** from ordinary reading | Retain only for meaningful navigation or an optional media interaction; honour reduced motion. |
| Footer navigation | Useful end-of-page orientation but currently repeats too much structure. | **Simplify** | Keep a small personal note, the four primary routes, secondary links, and contact. Remove redundant labels and extra descriptive blocks. |

## Homepage inventory

| Current element or pattern | Decision | Final treatment |
|---|---|---|
| Personal opening: hospitality-floor origin and “I make complicated things click” | **Keep** | One personal opening with a direct one-sentence promise and one primary lesson action. |
| “Current edition” and parallel descriptor line | **Remove** | The opening itself establishes author, purpose, and mood. |
| “Start wherever you like” eyebrow + “What would you like to see?” heading + explanatory paragraph | **Simplify** | One direct heading: “Start here” or “Choose what you need.” No extra preamble. |
| Four large pathway cards | **Keep, simplify** | Each route shows text-free artwork, direct title, one sentence, and the link itself. Remove arbitrary route numbers unless the visitor is genuinely following a sequence. |
| “Featured projects” label plus heading plus “See more” | **Simplify** | A single direct title, “Projects,” followed by three selected items and one archive link. |
| Project cards with number, category, media badge, source stamp, duration, author-like metadata, arrow, title, and description | **Simplify aggressively** | Default card: image, title, one useful sentence, and optional duration only for a lesson/course. No automatic author, sequence, “Five steps,” project type, or decorative badge. |
| “Free tools” block | **Keep, simplify** | Three tool rows, each naming the task and outcome. Remove tool counters and repeated free/format labels. |
| Personal closing note | **Keep** | One short first-person note and one contact action. Remove a second About CTA if the section itself is already linked. |
| Homepage archive behaviour, search, filters, long lists, and duplicate author block | **Remove** | Archives belong on Projects and Tools, not Home. |

## Lessons and course-entry inventory

| Current surface | Decision | Final treatment |
|---|---|---|
| `/instructional-design` direct lesson title | **Keep** | Retain “How to make instructions easier to follow.” Present it as a short lesson, not as a discipline demonstration. |
| Instructional-design term in descriptions and metadata | **Simplify** | Lead with the everyday outcome; retain the profession only in secondary context. |
| AI course entry and cover | **Keep** | Describe as a course about AI in plain language. Duration appears once, near the start action. |
| Rise-style course internal progress and lesson order | **Keep** | This is meaningful learning navigation, not decorative metadata. |
| Course screenshots, diagrams, and images with embedded labels | **Remove or replace** where not instructionally required | Course visuals remain text-free unless labels are essential to the diagram; essential labels become high-contrast HTML/SVG text. |

## Projects inventory

| Current surface | Decision | Final treatment |
|---|---|---|
| `/my-work` route | **Keep, rename publicly** | Public title and navigation become “Projects.” Existing route can be retained initially for stability. |
| Project collection introduction | **Simplify** | One direct line explaining that these are courses, comics, and explainers Naveen made for real work. |
| Filter rail or archive controls | **Remove** unless the final project count makes a real visitor task impossible without them. |
| Project thumbnails | **Keep** | Artwork shows context. Metadata does not sit on top of images. |
| Card labels such as “project story,” “interactive course,” “case study,” author, arbitrary count, and project step labels | **Remove by default** | Use format only when it changes the visitor’s decision; for example, show “95-minute course” once on the AI course. |
| Project-detail page | **Keep, restructure** | Context, problem, approach, result, and one personal reflection. Remove portfolio-theatre labels and duplicated metadata. |

## Free tools inventory

| Current surface | Decision | Final treatment |
|---|---|---|
| `/tools` page | **Keep** | Public title: “Free tools.” Opening answers what the tools help a visitor do. |
| Tool counters (`01`, `02`, etc.) | **Remove** | The order is not a process. |
| Tool category labels such as planning, assessment, storyboarding | **Simplify** | Replace with an ordinary outcome: “Make a calendar,” “Make a quiz,” “Plan a story,” “Improve an email.” |
| Individual tool app UI | **Keep** | Functional labels remain direct and task-led. Do not apply portfolio decoration to working applications. |
| Tool descriptions | **Simplify** | One sentence: task, input, result. No product marketing vocabulary. |

## About inventory

| Current surface | Decision | Final treatment |
|---|---|---|
| Five chronological chapters | **Keep** | This is a meaningful sequence; chapter numbers remain because the order matters. |
| Page heading and lead | **Keep, simplify** | “From hotel floors to learning design,” followed by plain first-person context. |
| Professional stamps and certification framing | **Remove or move** | Certification belongs in a quiet factual detail only if needed; it is not the opening identity. |
| One image and one memory per chapter | **Keep** | Preserve narrative clarity and personal ownership. |
| CTA pair at the end | **Simplify** | One primary path to Projects or contact; secondary path remains a plain text link if retained. |

## Secondary pages inventory

| Page | Decision | Final treatment |
|---|---|---|
| Experiments (`/lab`) | **Keep, move secondary** | Direct title “Homepage design experiments”; short plain explanation; no primary-nav promotion. Individual experiments remain visually independent. |
| How this site works (`/colophon`) | **Keep, move secondary** | Direct factual note about technology, originals, privacy, and sources. |
| Notes | **Keep only when there is a real note to publish** | Do not create an empty publication category merely for architecture. |
| Downloads | **Keep only as an action within a relevant project/tool** | Do not keep a standalone downloads destination unless it contains a useful collection. |

## Required copy removals and replacements

| Pattern | Remove or avoid | Replace with |
|---|---|---|
| Indirect title | “What gets built when…” | “How to make instructions easier to follow” |
| Abstract collection title | “Things people could actually use” | “Projects” or “Courses, stories, and explainers” |
| Clever utility title | “The boring bits, made quicker” | “Free tools that save time” |
| Jargon-first tool label | “Assessment” | “Make a quiz” |
| Jargon-first project label | “Case study” | “Project story,” or no label at all |
| Unhelpful metadata | “Five steps · Naveen Jose” | Remove; title and page context already provide this information |
| Decorative count | `01`, `02`, `#03` | Remove except in a genuine sequence, timeline, or curriculum |
| Generic portfolio statement | “Designed for impact” | Specific project fact, personal observation, or remove |

## Phase 1 sign-off condition

Phase 1 is complete when every public route and shared pattern has a disposition, every known redundant metadata pattern has an explicit removal rule, and the pages that need a distinct content form are identified. The next phase will turn this inventory into text-first page outlines before changing layout or styling.
