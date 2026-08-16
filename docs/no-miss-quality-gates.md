# No-Miss Redesign: Implementation and Quality-Gate Procedure

## Operating principle

The rebuild proceeds **content first, page family second, release last**. No page is treated as complete because it renders. It is complete only when it passes general-visitor, ownership, accessibility, responsive, and technical checks.

## Work sequence

| Stage | Scope | Required output | Stop condition |
|---|---|---|---|
| 0. Freeze | Preserve the current published baseline and capture current route states. | Baseline screenshots and route inventory. | No broad visual edit begins without a recoverable baseline. |
| 1. Subtract | Apply the keep/simplify/move/remove inventory to shared chrome and Home. | Diff that removes redundant labels, counts, metadata, and duplicate actions. | Every remaining visible item has a documented visitor job. |
| 2. Rewrite | Apply the text-first outlines to the public page family. | Direct titles, one-sentence descriptions, task-led actions, and specific personal notes. | A non-specialist can identify each page’s purpose in ten seconds. |
| 3. Compose | Build visual hierarchy from the approved design system. | Page structure, typography, imagery, and restrained components. | No local component or image treatment contradicts the shared system. |
| 4. Test | Exercise interactions, navigation, mobile layout, and accessibility. | Desktop and mobile evidence plus console and build checks. | All page-family gates pass. |
| 5. Release | Commit and push one coherent page-family update. | Clean diff, release note, and verification record. | Main branch matches the validated implementation. |

## Page-family implementation order

The order is intentional. It prevents shared UI from being built around a weak homepage or a one-off project card.

1. **Shared chrome:** masthead, footer, logo, navigation, global spacing, focus, and dark-mode rules.
2. **Home:** proof of the final structure and primary visitor path.
3. **Projects and project details:** establishes image, list, and case-story composition.
4. **Free tools and tool entry:** establishes utility discovery without portfolio decoration.
5. **Lessons and course entry:** establishes learning discovery while leaving the course player structurally independent.
6. **About:** applies the narrative chapter form and personal voice.
7. **Secondary pages:** experiments and site-making notes.
8. **Whole-site pass:** remove reintroduced duplication and reconcile all shared patterns.

## Required review lenses

Each page family is reviewed through all five lenses. A visual approval cannot override an accessibility or clarity failure.

| Lens | Questions |
|---|---|
| General visitor | Can a visitor unfamiliar with learning design explain the page, identify the next action, and understand a project/tool without decoding labels? |
| Personal ownership | Does the copy include a real experience, project fact, decision, or point of view? Could it otherwise belong to any portfolio? |
| Interface restraint | Does every label, border, card, arrow, badge, counter, and action have a non-duplicated purpose? |
| Accessibility | Are headings semantic, focus visible, contrast sufficient, images described, controls keyboard-operable, and motion optional? |
| Responsive quality | Does mobile preserve content order and a clear first screen without clipped text, dense metadata, or fake desktop-card layouts? |

## Mandatory checks before a page-family release

### Copy checks

1. Run a direct-language scan for terms such as “featured,” “selected,” “explore,” “case study,” “web app,” “instructional design,” “impact,” “five steps,” and author labels.
2. Review every result manually. Precise professional terms may remain only when explained and useful to a visitor decision.
3. Verify that each heading names a topic rather than gesturing at one.
4. Verify that each button says what happens after activation.

### UI-subtraction checks

1. Hide each eyebrow, badge, count, metadata row, and arrow in turn. If the page still works without it, remove it.
2. Remove card borders temporarily. If the grouping remains clear, keep the open layout.
3. Confirm that no card repeats a title, route destination, author, and CTA in several forms.
4. Confirm that images are text-free unless an instructional diagram genuinely requires labels.

### Visual checks

1. Inspect the first viewport at desktop and `375 × 812` mobile.
2. Inspect the longest project, tool, and About route at desktop and mobile.
3. Inspect light and dark themes if a theme switch is provided.
4. Inspect image crop, logo size, visual contrast, and hierarchy without relying on extracted text.

### Functional checks

1. Keyboard-tab through navigation, theme control, route choices, cards, CTA, and footer.
2. Verify menu open/close, route links, focus return, and scroll restoration.
3. Verify page titles, descriptions, favicon, Open Graph metadata, and visible logo consistency.
4. Verify that the course retains its progress state and its independent learning interaction logic.

### Technical checks

1. Run the production build with the development server stopped when memory permits.
2. Check the browser console after core route navigation.
3. Check for failed image requests and missing alternative text.
4. Run a whitespace and scope review before staging.

## Visual acceptance rubric

| Criterion | Reject when | Accept when |
|---|---|---|
| Clarity | The visitor must read several labels to know what the page is for. | The title, one sentence, and first action make the page obvious. |
| Restraint | Every section uses the same card, eyebrow, border, and CTA combination. | The content form changes with the page’s job. |
| Personality | Copy relies on claims such as “human,” “impactful,” or “innovative.” | Copy contains particular memories, choices, work facts, or observed problems. |
| Identity | The five-bar mark is pasted into decorative contexts or several logo styles appear. | One quiet mark and one wordmark appear consistently at intended brand touchpoints. |
| Image quality | Images contain text, duplicate the heading, or exist only to fill a card. | Images show work, context, or a concept that cannot be explained as well with text alone. |
| Mobile | Desktop metadata and control density are merely squeezed into a smaller width. | Mobile has the same information priorities and comfortable reading/touch rhythm. |

## Release discipline

Each release contains one coherent page family or shared-system change. It includes the affected source, content, asset-register updates, validation record, and delivery checklist updates. Do not combine unrelated experiments, broad content creation, and core navigation changes in the same release.

## Phase 4 sign-off condition

The procedure is complete when every future edit has an explicit ordering, review lens, test checklist, visual acceptance rubric, and release rule. The next phase summarizes the complete strategy and begins the actual shared-chrome and homepage implementation against these gates.
