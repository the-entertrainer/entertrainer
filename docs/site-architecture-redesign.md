# Site architecture and homepage redesign

## Audit finding

The existing site has strong editorial components, but the homepage carries too many jobs at once. It introduces the portfolio, promotes the instructional-design demonstration, exposes a searchable archive, repeats the project and tool catalogue, adds an author note, and then repeats an author identity block. That volume makes the first page an archive interface rather than a clear starting point.

The primary destinations already exist and should become the organising system: **Practice** for demonstrations of instructional craft, **Projects** for commissioned and self-directed work, **Tools** for browser-based utilities, and **Story** for the personal narrative. The Lab, Colophon, Downloads, and individual work pages remain valid secondary destinations, but do not need equal visual priority in the first screen or main collection path.

## Architecture decision

| Page | Job | Keep | Remove or relocate |
|---|---|---|---|
| Home | Explain the proposition and route visitors into four primary pathways | Proposition, selected evidence, concise links to the four pathways | Full archive search, category filter rail, repeated author aside, duplicate catalogue cards |
| Practice | Show the method through an interactive teaching demonstration | Existing instructional-design experience | None |
| Projects | Let visitors scan credible learning work and open case studies | Existing projects collection and case studies | Redundant collection byline |
| Tools | Let visitors choose a useful browser utility quickly | Existing tool collection and utility pages | Redundant collection byline |
| Story | Provide background and trust context after the work is understood | Existing five-stop narrative | Duplicate opening identity treatment |
| Lab, Notes, Downloads | Keep useful secondary material discoverable without competing with the main journeys | Existing pages, footer links, contextual read-next links | First-screen prominence |

## Homepage hierarchy

1. **Proposition:** what Entertrainer does and who it is for.
2. **Four pathways:** Practice, Projects, Tools, and Story, each with an original visual signifier and one direct route.
3. **Selected work:** three representative learning experiences, including the AI course.
4. **Useful tools:** four compact app links, framed as practical help rather than portfolio evidence.
5. **Contact and trust:** a concise, single end-of-page invitation.

The rebuilt home page will not include a page-level search, filter rail, full archive grid, rotating copy, or a second author block. Those are either archive functions better served by dedicated pages or interface repetition that does not help a first-time visitor choose a destination.

## Implementation and validation

The homepage now follows the documented route-first sequence: proposition, four original visual pathways, three selected learning experiences, four practical tool rows, and one concise closing invitation. The original Practice, Projects, Tools, and Story pathway illustrations load from stable project CDN URLs and are paired with simple inline geometric icons for a quick non-text cue.

On desktop, the proposition and purpose stay in the first screen; the four primary paths appear immediately after, in a two-column field that allows visual comparison without turning the page into an archive grid. At `375 × 812`, the headline, supporting copy, primary action, and first section label remain readable and unclipped; the route cards, selected work, and tool list collapse to a single-column sequence farther down the page.
