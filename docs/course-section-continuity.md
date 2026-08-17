# Course Section Continuity Contract

## Purpose

Both course routes use clear, learner-controlled movement between major instructional sections. A continuation control signals the next section in direct language and appears only after the current instructional requirement is satisfied. The control never skips required practice, feedback, or an existing course gate.

## Continue control

Every major section ends with one **Continue** control. Its label names the immediate learning destination, for example, “Continue to evidence and examples” or “Continue to learner analysis.” A control advances the section state, preserves existing completion data, moves focus to the new section heading, and scrolls that heading into a comfortable reading position.

The visual treatment remains shared: cobalt action surface, clear pressed state, visible keyboard focus, and a small directional arrow that moves only on hover or focus. Controls that depend on an interaction remain disabled until that interaction receives a learner response.

## Section entry

Newly released sections enter once with a short vertical settle and fade. Its component-level sequence is intentionally restrained: the section label appears first, heading and lead text follow, then supporting media or practice enters last. The content stays in normal document flow at all times; animation never hides usable reading content indefinitely or changes the order perceived by assistive technology.

## Accessibility

When the operating system requests reduced motion, release transitions become immediate and scrolling becomes non-animated. Focus is sent to the newly released section heading, using `tabindex="-1"`, so keyboard and screen-reader users receive the same clear transition that pointer users see visually.
