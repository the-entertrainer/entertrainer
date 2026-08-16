# Entertrainer whole-site design audit

## Scope and method

This audit reviews the public Entertrainer experience across the homepage, project discovery, practice, tools, story, and the self-contained AI course. The aim is not to flatten the portfolio into a generic product site. It is to keep the editorial character while making hierarchy, navigation, controls, and responsive behaviour easier to understand at first use.

## Initial shared-system findings

The public site already has a strong editorial foundation: a restrained neutral palette, clear category colours, consistent publication masthead, readable serif/display pairing, visible focus treatment, and a coherent card grammar. The homepage and projects index use the same masthead and content grid, which establishes a recognisable publication identity.

The principal issue is **density of visual voices**, not absence of a visual system. The homepage combines a publication masthead, a very large expressive hero, bright category accents, hand-written-style microcopy, mono metadata, card borders, image frames, and several invitation patterns on its first scroll. The projects index is materially calmer, but its red card surfaces and repeated chips still read as a separate card system from the homepage hero and from the quieter AI course.

| Priority | Finding | User impact | Correction direction |
|---|---|---|---|
| High | The homepage’s first screen presents several competing visual hierarchies: masthead, issue strip, display hero, underlined phrase, profile copy, and two equal calls to action. | A new visitor must decide where to read first and what Entertrainer is for. | Reduce first-screen signals to one identity line, one display message, one short supporting paragraph, and a primary/secondary CTA hierarchy. |
| High | Category accents are saturated and prominent in cards, filters, hero emphasis, and labels. | The site can feel more like an experimental magazine collection than a coherent professional portfolio. | Keep category colours as small wayfinding signals; make the neutral editorial system do the structural work. |
| Medium | Project cards use heavy colour frames and several small labels in a tight composition. | Image, category, title, deck, duration, and arrow compete for attention. | Preserve the card content but reduce frame saturation, promote the title, and quiet metadata. |
| Medium | Navigation labels are clear but the desktop masthead treats all destinations with equal visual weight. | The intended first journey is not explicit. | Retain the concise navigation but use the active route and a single more prominent “Work” destination to clarify orientation. |
| Medium | The AI course is visually isolated from the editorial site by necessity, but its entry card and surrounding site language need a more deliberate bridge. | The course can read as an imported product rather than a flagship portfolio artifact. | Align entry metadata, image treatment, and invitation copy while retaining the course’s self-contained Rise-style player. |

## Screens reviewed

The homepage demonstrated a well-built responsive masthead and a distinctive editorial voice, but needs first-screen simplification and calmer category application. The projects index demonstrated a strong, usable three-card comparison grid and a clear project route, but needs lower card-surface intensity and cleaner metadata hierarchy.

The next audit pass will review the practice page, tools index, individual tool shell, story route, and mobile layouts before a shared correction plan is finalised.

## Practice and web-apps findings

The practice page is the strongest example of the site’s instructional voice: its interaction begins with a clear question, exposes the learning outcome through direct manipulation, and gives the reader a sensible reason to continue. Its opening section is nevertheless more complex than it needs to be because the coloured category pill, display title, body deck, author row, large bordered question surface, three controls, and interaction state all arrive within one view. The instructional interaction should remain, but its introductory apparatus can be reduced.

The web-apps index has a clear promise—free, private, single-purpose tools—but repeats the same saturated-green image card pattern for every app. That makes the category immediately identifiable, but the content of four distinct tools becomes visually interchangeable. The reusable card should move its category colour to a thinner top rule or a small label, allowing each product image and title to do the differentiation.

| Priority | Finding | User impact | Correction direction |
|---|---|---|---|
| High | Repeated saturated media frame colours dominate the work and tool grids. | Cards are recognised as a category before they are recognised as individual work. | Reduce media-frame accent to a 4px category rule and a restrained label; retain neutral media backgrounds. |
| High | Entry-page author identity repeats below the masthead on every index. | Valuable first-screen space is consumed by a repeated author row rather than each route’s actual proposition. | Keep the author row on the home and About pages; simplify it on collection pages to a single byline or remove it. |
| Medium | The practice interaction is valuable but appears in a container that visually competes with the heading above. | The page has two “hero” surfaces before the reader understands the sequence. | Introduce a plain “Try it” lead-in and move the interaction into a quieter labelled section. |
| Medium | Four tool cards use the same category-green visual field. | Tool purpose is less scannable than the category treatment. | Use each tool’s existing product image as the main visual; reserve green for availability and category metadata. |

## Story and tool-shell findings

The About route has stronger image-to-story rhythm than the collection pages. It carries the portfolio’s editorial premise well, but repeats the portrait in the opening area and then inserts a second hero graphic before the first narrative chapter. The page would benefit from one authoritative opening portrait treatment and a more deliberate transition into the five-stop narrative.

The StoryGen tool shell demonstrates a different problem: the editorial masthead and full publication footer frame an interface that is intentionally a focused workspace. On first use, the page has an oversized blank field around the app identity, a low-emphasis “New storyboard” control, and no contextual starting path beyond an empty-state sentence. The tool needs a compact application chrome with a visible primary action and a short example/start choice, while preserving the site-level exit route.

| Priority | Finding | User impact | Correction direction |
|---|---|---|---|
| High | Functional tools inherit the editorial masthead and long footer without a distinct app-mode frame. | Workspace focus is diluted and the primary task begins too far below non-task chrome. | Add a compact app header mode inside `ToolShell`, retain a clear back-to-site route, and defer the editorial footer until below the active workspace. |
| High | StoryGen’s empty state does not make its first meaningful action sufficiently obvious. | A new user sees a polished identity but not an immediate workflow. | Elevate “New storyboard” as the primary action and add a concise start path with one sample framework. |
| Medium | The About opening repeats personal imagery before the narrative begins. | The page spends visual attention on identity twice before telling the story. | Retain one portrait/identity treatment and make the illustrated “Hotel floors…” card the bridge to Chapter 1. |
| Medium | The app shell’s large white empty space and low-contrast background glow do not communicate purpose. | The experience can look unfinished rather than intentionally calm. | Use a contained first-run panel with a simple three-step start sequence and quiet neutral surface. |

## Mobile review

The mobile homepage has a clean compact masthead: the wordmark, theme toggle, and menu button fit without clipping. Its main issue is vertical priority rather than mechanical responsiveness. The first viewport shows an issue strip, italic editorial line, preface, hero, deck, two equally weighted calls to action, and the start of a second invitation. The page is readable, but the intended first action is diluted.

The mobile web-apps index is structurally sound and cards reflow correctly. However, the saturated green media band occupies substantially more visual area than the tool’s title and description. The author identity row also repeats immediately before the collection grid, creating a gap between the promise (“Free web apps…”) and the action of selecting one.

| Priority | Finding | User impact | Correction direction |
|---|---|---|---|
| High | Homepage mobile has two visually equal CTAs after a long hero deck. | A first-time visitor has no clear primary route. | Establish one filled primary CTA and reduce the second choice to a compact text link or quiet outline action. |
| High | Collection-page mobile cards devote the largest area to category saturation. | Product titles and short purpose statements arrive late in the scanning order. | Reduce category media frame height and saturation; make title and tool purpose the first readable card elements. |
| Medium | Collection-page author row repeats below the page deck on small screens. | The first card is pushed below the fold without aiding choice. | Remove or compress the author row on collection indexes below 640px. |
| Medium | The mobile masthead hides the section labels behind a menu while preserving a large blank strip below. | The screen spends more vertical space on chrome than needed. | Reduce masthead/subhead combined height and retain a clear current-section indicator. |

## Design correction plan

The site will retain its editorial-publication identity. The correction is not a visual rebrand; it is a consolidation. The rebuilt system will make **content and task** the primary visual signals, while category colour, author identity, mono metadata, and decorative type variation become secondary supporting signals.

| Layer | Current issue | System correction |
|---|---|---|
| Page hierarchy | Multiple surfaces compete for “hero” status. | Each page receives one lead: the title and proposition. Subsequent content uses a simple editorial sequence of summary, primary action, and work/content. |
| Colour | Saturated category colour dominates imagery and repeats as frame, chip, rule, and emphasis. | Use category colour only in one compact location per component: a label, a 4px top rule, or a small active indicator. |
| Cards | Work and tool cards use large colour media fields plus several labels. | Adopt a neutral card with a narrow category rule, image at a lower visual weight, title-first content, quiet metadata, and a clearly placed action. |
| Navigation | The public shell makes all destinations equal and repeats identity detail on every index. | Add active-route indication, maintain a concise menu, and remove or compress repeated author blocks from collection pages. |
| Mobile | First viewports use too much chrome and secondary identity. | Compact masthead, suppress secondary publication descriptor at narrow widths, elevate one primary action, and place first content card above repeated identity elements. |
| Tools | Application task flow is framed like an article. | Introduce a practical app-mode header and an intentional first-run state with one primary action and a sample path. |
| Motion | The editorial site has good baseline motion but some pages animate type and media simultaneously. | Keep motion as a route/page cue only; high-frequency cards and filters respond through colour and border, not movement. |

## Prioritized implementation

The highest-impact correction pass will update the shared **Masthead**, **Card**, collection/index-page layout, and **ToolShell**. These surfaces account for the home, projects, tools, and individual tool journeys, so correcting them produces a coherent result without destabilising the course player or lab artifacts.

The home page will receive a clearer primary route and less competition among its first-screen elements. The projects and tool indexes will use calmer cards and omit the redundant collection-level author row. Tool first-run states will place task initiation ahead of brand treatment. The About page will preserve its narrative and images, with only a small opening treatment simplification in this pass.

## Post-correction verification

The updated homepage retains the editorial identity but now gives the learner-design demonstration a single filled primary action. The free-apps route has become a lower-emphasis inline destination rather than a visually equal second button. This preserves discovery without asking a new visitor to make two equal decisions at the first interaction point.

The updated tools index no longer renders a redundant author row between its promise and the available applications. Shared cards now use a thin category-colour rule above neutral artwork rather than a saturated category-colour field. The result makes the individual product artwork, name, and one-sentence purpose visible before category colour, while keeping the colour cue for quick scanning.

At `375 × 812`, the homepage now presents a visibly clear action hierarchy: the instructional-design route is the single filled primary button and the web-apps destination is an inline secondary link. The mobile tools index now reaches its first tool card immediately after the page proposition; the neutral image panel, thin green category rule, and title-first content treatment make StoryGen’s purpose more readable than the previous saturated-green card frame.

The revised About mobile opening now presents the name, proposition, location/reading metadata, the “Hotel floors to learning design” bridge image, and the five-stop narrative in that order. The duplicate portrait/byline treatment is gone from the first screen.

The homepage was also checked in the supported dark theme. The revised neutral cards, primary action, inline secondary link, category rules, wordmark, and navigation retained readable contrast without reintroducing the earlier saturated-frame treatment.
