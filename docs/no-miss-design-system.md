# No-Miss Redesign: Final Information Architecture and Design System

## Information architecture

### Primary navigation

| Label | Destination | Visitor promise |
|---|---|---|
| Lessons | `/instructional-design` and course entry | Try a short lesson or begin a longer course. |
| Projects | `/my-work` | See courses, stories, and explainers Naveen made. |
| Free tools | `/tools` | Use small browser tools that save time. |
| About | `/about` | Read how Naveen moved from hotel floors into learning design. |

### Secondary navigation

| Label | Destination | Location |
|---|---|---|
| Homepage design experiments | `/lab` | Footer and site-making notes only. |
| How this site works | `/colophon` | Footer and About only. |
| Contact | Email and LinkedIn | Footer and purposeful closing notes. |

No page adds a fifth primary destination without a demonstrated visitor need.

## Identity system

### Brand essence

> **Entertrainer is Naveen Jose’s place for lessons, useful tools, and clear explanations that make complicated work easier to understand.**

The identity should be curious, practical, and quietly particular. It should never imitate a studio, agency, software company, or generic “thought leader.” The overall impression is a personal working publication built by someone who cares about the moment understanding arrives.

### Logo

The approved Entertrainer mark is the preloader-derived **five-bar vertical signal** and a live lower-case **entertrainer** wordmark. The bars move from violet to cool blue on an ink field. The wordmark is never rasterized or generated as an image.

| Context | Form |
|---|---|
| Masthead and footer | Five-bar signal plus lower-case wordmark. |
| Preloader | Signal at a larger scale plus lower-case wordmark. |
| Favicon and compact app context | Five-bar signal only. |
| Social preview | Signal and wordmark only when required; no additional logo lockup. |

### Colour

| Token | Purpose | Constraint |
|---|---|---|
| Paper | Main page ground | Large areas remain calm and low-contrast in saturation. |
| Ink | Main reading and navigation colour | Use for text, rules, and logo container. |
| Muted ink | Supporting description and secondary metadata | Never reduce contrast below accessibility requirements. |
| Blue-violet signal | Brand recognition and a small amount of interaction emphasis | Use in the logo, focus state, active route, selected moments, and limited text emphasis. |
| Category colour | Quiet archive orientation only | Never fill all cards or become the page’s dominant visual field. |

### Typography

| Role | Use |
|---|---|
| Display face | One meaningful page title or major personal statement per screen. |
| Reading face | All explanatory copy, project descriptions, and personal narrative. |
| UI face | Navigation, buttons, direct labels, short metadata, and tool controls. |

No component adds a new display face, handwritten face, or novelty typography. Headline scale establishes hierarchy; decorative styling does not.

### Images and illustrations

Images have one of three jobs: show real work, establish personal context, or clarify an idea. They remain text-free unless the image is a true instructional diagram. Any necessary labels are accessible HTML or SVG text, not generated image text.

Each page uses fewer, stronger images. The default is one strong context image or a small curated group; the page does not need artwork in every section.

## Layout system

### Spacing and reading rhythm

1. Each page begins with one clear title/purpose relationship.
2. Use whitespace as a structural device; do not compensate for empty space with cards, extra labels, or decorative rules.
3. A content section may be text-led, image-led, list-led, or task-led. Do not force every section into the same split-card arrangement.
4. The reading width stays comfortable before grid density is considered.
5. Mobile layouts preserve the same content order; controls and media reflow but do not create a different information architecture.

### Surface system

| Surface | Intended use |
|---|---|
| Open paper | Default for page narrative, lists, and most reading. |
| Simple rule | Separate unrelated sections or establish a real sequence. |
| Bordered project presentation | Curated project item only when image and summary need to stay together. |
| Tool row | Functional discovery of a utility, with a direct action. |
| Quiet note | One personal reflection or context detail per page at most. |

There are no universal rounded-card stacks, global gradient panels, badge piles, decorative counters, or background treatments attached to every content type.

## Component limits

| Component | Maximum rule |
|---|---|
| Page eyebrow | Use only when it provides grouping or sequence that the title does not already communicate. |
| Project metadata | One relevant detail at most; duration only where it changes commitment. |
| Author line | Never on a page or card belonging to Naveen’s own site. |
| Counter | Only on a true series, course module, timeline, or chronological About chapter. |
| CTA | One primary CTA per section. Card link already counts as the CTA. |
| Arrow | Use once per link pattern, not in every nested label. |
| Personal note | One per page, and it must contain a real experience or reason. |
| Motion | One navigation/interaction response at a time; no decorative reveal sequence during reading. |

## Voice system

The site writes in first person when it describes Naveen’s reason, story, or decision. It writes in second person when it explains a visitor outcome. It uses ordinary language before precise professional terms.

| Avoid | Prefer |
|---|---|
| “Instructional design solution” | “A clearer lesson” or “an easier instruction to follow” |
| “Case study” | “Project story,” or no format label |
| “Web app” | “Free tool” plus the task it helps with |
| “Assessment” | “Make a quiz” |
| “Curated work” | “Projects I made” |
| “Explore” | “See the projects,” “Try the lesson,” or “Use the tool” |

## Phase 3 sign-off condition

Phase 3 is complete when every page family can use this system without inventing a local visual language, the primary navigation is limited to four visitor questions, and all component constraints are clear enough to reject redundant UI during implementation.
