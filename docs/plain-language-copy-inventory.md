# Site-wide plain-language copy inventory

This inventory records every visible-text candidate identified during the parallel review of the application. It applies the retention criteria in [`plain-language-copy-audit.md`](./plain-language-copy-audit.md). Text that directly teaches, describes a project, names a destination, tells a person what an action does, provides source or attribution, reports meaningful state, or supplies accessibility context is intentionally not listed.

| Area | File | Existing text | Disposition | Replacement or action |
|---|---|---|---|---|
| Loading | `components/ed/Preloader.vue` | Preparing a clearer way in | Remove | Remove visible message. Keep screen-reader-only loading status. |
| Loading | `app/spa-loading-template.html` | Preparing a clearer way in | Remove | Remove visible message. |
| Homepage | `pages/index.vue` | Three ways in | Remove | Remove redundant lead-in. |
| Homepage | `pages/index.vue` | A few things I made | Remove | Remove redundant lead-in. |
| Shared link | `components/ed/ReadNext.vue` | All of it | Rewrite | See all. |
| Footer | `components/ed/Footer.vue` | Built by hand, mostly in the evenings | Remove | Remove personal atmosphere line. |
| About | `pages/about/index.vue` | This is how I got here. | Rewrite | Here is my path. |
| About | `pages/about/index.vue` | Something I keep | Rewrite | A line I keep. |
| Lessons | `pages/lessons/index.vue` | Short, practical learning experiences for people who want to understand something clearly and try it for themselves. | Rewrite | Short lessons you can understand and try. |
| Editorial registry | `content/editorial.ts` | Play it in the page | Rewrite | Try the lesson. |
| Editorial registry | `content/editorial.ts` | A full module you can finish in ten minutes. | Rewrite | A ten-minute module. |
| Editorial registry | `content/editorial.ts` | Storyboard on an infinite canvas — cards, flows, and a Word export at the end of it. | Rewrite | Storyboard on an infinite canvas with cards, flows, and Word export. |
| Editorial registry | `content/editorial.ts` | Turn a list of topics into a monthly training calendar you can actually present. | Rewrite | Turn a list of topics into a presentable monthly training calendar. |
| Editorial registry | `content/editorial.ts` | Paste a messy draft, get an email you would actually send. | Rewrite | Paste a messy draft and get a send-ready email. |
| Editorial registry | `content/editorial.ts` | About the person | Rewrite | About Naveen. |
| SEWA case study | `pages/my-work/sewa-chronicles.vue` | Learning people actually want to finish — that's the whole idea. | Rewrite | I design learning people want to finish. |
| AI course | `pages/courses/ai-atlas.vue` | A field grew beside real machines | Rewrite | AI developed alongside physical computers. |
| AI course | `pages/courses/ai-atlas.vue` | One useful system | Rewrite | System example. |
| AI course | `pages/courses/ai-atlas.vue` | Watch patterns | Rewrite | Machine-learning video. |
| AI course | `pages/courses/ai-atlas.vue` | Quick decision | Rewrite | Choose the required input. |
| AI course | `pages/courses/ai-atlas.vue` | Take this with you | Remove | Remove label. |
| AI course | `pages/courses/ai-atlas.vue` | Use the route, not a shortcut | Rewrite | Use this workflow. |
| AI course | `pages/courses/ai-atlas.vue` | That is the move from No AI to Know AI. | Remove | Remove branded closing line. |
| AI course | `pages/courses/ai-atlas.vue` | Use with care | Rewrite | Responsible use. |
| Instructional Design course | `pages/instructional-design/index.vue` | A planning map | Remove | Remove label. |
| Instructional Design course | `pages/instructional-design/index.vue` | Use the design language once more. | Rewrite | Match each design stage to its purpose. |
| Instructional Design course | `pages/instructional-design/index.vue` | Take this with you | Rewrite | Key takeaway. |
| Instructional Design course | `pages/instructional-design/index.vue` | Good learning design starts before the screen. | Rewrite | Start with the real task. |
| Instructional Design course | `pages/instructional-design/index.vue` | The route continues when the work is observed, practised, and checked with evidence. | Remove | Remove redundant closing narration. |
| Colophon | `pages/colophon.vue` | Built in the evenings, mostly. | Remove | Remove personal atmosphere line. |
| Colophon | `pages/colophon.vue` | If something here is broken, I would genuinely like to know. | Rewrite | Found a problem? |
| Colophon | `pages/colophon.vue` | Tell me what broke | Rewrite | Report a problem. |
| Glass Lab | `pages/glass-lab.vue` | Tune freely. | Remove | Remove generic encouragement. |
| Glass Lab | `pages/glass-lab.vue` | Colours are random — use Shuffle. | Rewrite | Shuffle colours to generate new colours. |
| Glass Lab | `pages/glass-lab.vue` | Copy the config and paste it back to bake into the site. | Rewrite | Copy the config to save or restore these settings. |
| Colophon | `pages/colophon.vue` | No database and no analytics. | Rewrite | This site has no database or analytics. |
| Colophon | `pages/colophon.vue` | This is not a courtesy. | Remove | Remove rhetorical emphasis. |
| Colophon | `pages/colophon.vue` | Nothing you type leaves your browser | Rewrite | Your StoryGen projects stay in your browser. |
| StoryGen | `pages/tools/storygen.vue` | Product tour | Rewrite | Show tour. |
| StoryGen | `pages/tools/storygen.vue` | New storyboard with AI… | Rewrite | Create storyboard with AI. |
| StoryGen | `pages/tools/storygen.vue` | AI settings… | Rewrite | AI settings. |
| StoryGen | `pages/tools/storygen.vue` | Design plan worksheet | Rewrite | Open design plan. |
| StoryGen | `pages/tools/storygen.vue` | Show the tour | Rewrite | Tour. |

## Retained text

The audit retains lesson explanations, questions, feedback, source captions, project descriptions, meaningful progress information, field labels, keyboard and screen-reader status, navigation names, direct action labels, privacy disclosures, alt text, and error states. These remain because removal would affect learning, decision-making, navigation, provenance, or accessibility.

## Visual validation notes

On 20 August 2026, local browser verification confirmed that the first visible preloader state contains only the animated Entertrainer mark and the screen-reader-only preparation status. The visible support sentence, rule, and five ticks are absent. After its finite handoff, the homepage presents direct route names, selected-work heading, actions, project descriptions, and privacy disclosure without empty visual gaps. The Instructional Design course uses the same logo-only gate and opens to its original course cover, learner-facing introduction, progress controls, and teaching copy without a residual loading overlay. The AI course uses the same loader, retains its original course-cover artwork and learner controls, and opens with a direct course description and source-backed instructional narrative.

On 21 August 2026, local homepage validation confirmed that the final hero proceeds directly from title and explanatory sentence to its two actions. The illustration caption, identity kicker, route-section headline, and card ordinals are absent. The following content starts with the three named route cards, followed by the direct “Selected work” section and its navigation control.

## Stricter presentation-only second pass

| Location | Text or pattern reviewed | Decision | Reason |
|---|---|---|---|
| Homepage hero art | “From working notes to something people can use” | Removed | It narrated the adjacent illustration without adding an action, fact, or decision. |
| Homepage route section | “Choose a direction” and “Start with what you need.” | Removed | The three named route cards already identify available destinations; both labels only restated the layout. |
| Homepage hero | “Entertrainer · Naveen Jose” | Removed | The masthead identifies the site and the page copy identifies the author elsewhere. |
| Homepage route cards | `01`, `02`, and `03` | Removed | These were decorative ordinals; the route titles supply the usable hierarchy. |
| Course panels | Lesson number, screen count, progress, task type, source, and feedback labels | Retained | They support orientation, task completion, learner feedback, attribution, or recovery. |
| Case studies and project pages | Date, client, process, selected-pages, and media-caption labels | Retained | They provide evidence, provenance, or local navigation through the project story. |
| Tools and lab interfaces | Field labels, status labels, input counts, file names, and tour progress | Retained | They explain a current state or control; removing them would impair tool use. |
| Shared footer and navigation | Destination headings, contact labels, privacy disclosure, and copyright | Retained | They are direct navigation, legal, privacy, or contact information. |
| StoryGen and Strong learning tool | Module, lesson, assessment, and result labels | Retained | They name the current learning activity and support orientation through multi-step content. |
