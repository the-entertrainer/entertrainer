# Immersive Course Shell Audit

## Current chrome findings

The AI route is already bare at the shared application level and has a dedicated course player bar. It still uses a bottom `course__foot` navigation footer once a learner enters the course. That footer is course-specific, but it keeps the experience structurally page-like rather than a focused learning player.

The instructional-design route contains its own compact course controls, but the shared application shell currently wraps it in the public masthead and public footer. This is the clearest break in immersion: learner content appears between publication chrome and site-wide footer content.

## Required shell correction

Both routes should render without the public Masthead/Footer. Each route should have only a compact, screen-specific course bar at the top: an exit-to-lessons control, course title, true screen or lesson progress, and an optional compact module-map trigger. The instructional actions remain within the active learning screen, not in a global footer. The AI player’s existing Previous/Next footer will be replaced with in-screen action controls or compact controller logic next to the block-level continuation as appropriate.

## Visual-coverage finding

The two courses have built a mixed library of real evidence, original editorial work, deterministic diagrams, and activity context. The remaining issue is not only count; it is asset distinctness. Screens that teach different concepts need separate visual roles rather than a reused illustration with a new caption. The expanded generation plan therefore uses one asset per named conceptual gap, with no text rendered inside generated art and each asset carrying a durable CDN reference before integration.

## Initial original asset matrix

| Course | Visual family | Teaching purpose |
|---|---|---|
| AI | Early-computing bench | Make the historical origin of AI tangible. |
| AI | Context-window desk | Show how earlier tokens remain available as a model predicts. |
| AI | Input-to-output signal board | Show the difference between input, model work, output, and human check. |
| AI | Multimodal field kit | Compare text, images, sound, and sensor data without a text-heavy list. |
| AI | Evaluation worktable | Show representative task tests and human review as a concrete process. |
| AI | Responsible-use checkpoint | Visually introduce permission, privacy, evidence, and escalation. |
| Instructional design | Learner route objects | Support the objectives and learning-path screen. |
| Instructional design | Performance-gap lens | Make task, learner, environment, and evidence visible as different diagnostic angles. |
| Instructional design | ADDIE workbench | Give the planning-map and ADDIE explorer a dedicated material visual. |
| Instructional design | Task-trail field card | Contextualise the Route Builder decisions. |
| Instructional design | Storyboard evidence loop | Visually tie objective, practice, evidence, and revision together. |
