# Shared Course Progression Contract

## Purpose

Both Entertrainer courses will use the same **lesson-by-lesson progression model**. A learner always knows what is available now, why the next part is not yet available, and what action will make it available. The system uses purposeful disclosure, not artificial friction: explanatory blocks are read in short groups, while a learner action unlocks the next meaningful group.

## Shared learner states

| State | Learner can do | Visual treatment | Accessibility requirement |
|---|---|---|---|
| **Current block** | Read or complete the activity. | White learning surface, blue left signal, visible block number and a direct next action. | Heading and content are available in the normal reading order. |
| **Ready to continue** | Select **Continue** after reading, or submit a required interaction. | Compact blue continuation bar below the completed content. | A native button is focusable and states exactly what opens next. |
| **Locked block** | See the next block title and completion requirement, but cannot open its content. | Quiet light-blue surface, small lock icon, numbered sequence, and plain “Complete the block above to unlock this” text. | Content is not hidden from assistive technology without explanation; the lock reason is announced by text. |
| **Completed block** | Review the content, then move forward. | Thin green completion rule and a completed check. No celebratory modal or repeated animation. | Completed state is conveyed in text as well as colour. |
| **Unlocked lesson** | Start the next lesson from the lesson path. | Current Rise-style lesson row with a blue status point. | The next lesson control is enabled only after the prior lesson’s final block is complete. |

## Completion contract

1. **Reading blocks** unlock with an explicit **Continue** button. This avoids unreliable scroll tracking and lets learners move at their own pace.
2. **Practice blocks** unlock only after the learner has made a selection and submitted or checked it. A correct answer is not required to continue; feedback remains instructional after an incorrect attempt.
3. **Lesson completion** requires the lesson’s final continuation control. The next lesson then unlocks in both the in-course path and the contents menu.
4. **Persistence** stores the furthest unlocked lesson and all completed block IDs in local storage. Returning learners see the same unlocked path without being forced to repeat finished work.
5. **Review** remains available for all completed blocks and lessons. Learners cannot jump into unavailable lessons or bypass required lesson blocks.

## Block sequencing by course

| Course | Lesson path | Gate rule |
|---|---|---|
| **From No AI to Know AI** | Objectives → seven existing lessons → knowledge check → glossary match → summary. | The current lesson reveals its explanation, evidence, activity, and lesson conclusion in ordered blocks. The next lesson unlocks when the conclusion is completed. |
| **Introduction to Instructional Design** | Introduction and objectives → understand the need → plan learning → applied decision → final check and close. | The current lesson reveals explanation, evidence or visual, then purposeful practice. Each chapter opens only after the previous chapter is completed. |

## Shared visual language

The existing course surfaces are aligned around calm white reading space, a single cobalt-blue action colour, small mono metadata, high-contrast instructional feedback, and low-chrome rounded surfaces. The shared addition is a **progress rail**: small sequence numbers, a left border for the active block, a light-blue locked card, and a compact completion rule. There is no confetti, timer, forced animation, dark overlay, or scroll-jacking. Motion is limited to a short opacity-and-translate reveal when a block becomes available and is removed for reduced-motion users.

## Implementation notes

The AI course already has course-level local storage and lesson-level interactions; its drawer and cover outline will be disabled for locked entries. The instructional-design course will gain local storage, lesson/block identifiers, and an explicit top-level lesson path. Both implementations will preserve native buttons, visible focus states, live feedback text, and keyboard operation.
