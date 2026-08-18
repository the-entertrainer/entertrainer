# Comfortable Course Pacing and Graceful Motion Contract

## Finding

The immersive players correctly removed kilometre-long scrolling, but the AI player became too atomised at 31 screens and the instructional-design player at 17 screens. Several adjacent screens introduced an explanation, then showed its visual, then asked the learner to continue again. That pattern interrupts a learner before a single idea has felt complete.

The course controls also accumulated destination labels, arrows, and conditional instructions. Those labels expose implementation structure rather than supporting a calm learner rhythm. Forward actions must use the one word **Continue**. Backward navigation may use the plain word **Back**. Feedback and completion instructions belong beside the activity, never inside a navigation button.

## Comfortable screen target

| Course | Previous screen count | Revised target | Grouping rule |
|---|---:|---:|---|
| From No AI to Know AI | 31 | 22 | Pair an explanation with its most useful visual or evidence. Keep simulations, decision tasks, short videos, and final reflection as independent screens. |
| Introduction to Instructional Design | 17 | 13 | Pair a planning explanation with its worked visual example. Keep case decisions, Route Builder, matching, and final check as independent practice screens. |

The desired rhythm is **explain + see**, then **try**, then **continue**. A screen should carry enough content to finish a meaningful thought, but never require sustained page scrolling to reach its conclusion.

## AI regrouping map

The historical explanation joins Alan Turing evidence; the physical workbench stays with the timeline. The useful-system explanation joins the signal-board visual. Rules-and-patterns joins the pattern-card visual. Context explanation joins the context-window visual. Modern input types joins the field-kit visual; Astrobee video and input detective remain separate. Candidate output joins evaluation evidence; infrastructure is moved into the same explanatory visual sequence. Capability conditions joins the checkpoint visual; safeguards, responsible-use plan, final check, and takeaway retain their own purposeful actions.

## Instructional-design regrouping map

The definition screen joins the cause-check visual explanation. The planning map joins the ADDIE explorer. Alignment joins the observable-objective cue and its short check. Design artefacts join the planning-artefact choice. The route game, case decision, matching task, and final check remain standalone. The closing takeaway remains a distinct authored ending.

## Motion contract

The site moves at a reading pace, not a tap-feedback pace. The shared duration ramp becomes 140ms for press confirmation, 220ms for hover or small state change, 420ms for routine panel movement, and 700ms for a rare arrival or section reveal. The common easing is a soft deceleration, `cubic-bezier(.22, .82, .32, 1)`.

Forward course movement carries a new card gently from the right over 520ms. Backward movement mirrors it from the left over 520ms. The stack shadow settles independently rather than snapping. Public-page arrivals gain 20–35% more time and more generous stagger spacing. All non-essential movement remains removed under `prefers-reduced-motion: reduce`.
