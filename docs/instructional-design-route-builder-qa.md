# Instructional-Design Route Builder — QA Notes

## Learning purpose and placement

The dedicated game sits after the ADDIE explorer in Lesson 2. It presents one coherent café case across three short decisions: **Analyse** before choosing a solution, **Design** for a supported real-task practice, and **Evaluate** using evidence of later performance. This tests the relationship between instructional-design stages rather than asking learners to recall an isolated definition.

## Learner-flow validation

The game was played through its three correct decisions in a browser. Each touch-sized option displayed a selected state, then immediate instructional feedback. The route advanced only after the learner selected and checked a decision. After the third decision, the game reported “Route complete,” saved `routeGameComplete: true` in local storage, and enabled the previously disabled **Continue to alignment** control. The next course section remained locked until that continuation was used.

## Accessibility and mobile design

The game uses native buttons, visible focus outlines, an optional expandable hint, concise direct instructions, 62px minimum decision controls, clear disabled state, and the module’s existing reduced-motion-safe reveal behaviour.

## 375px mobile verification

A true 375px browser capture loaded the game within its Lesson 2 context. The game rendered at 322px wide inside the course canvas, the course had no horizontal overflow, and **Complete the Route Builder to continue** was correctly disabled before game completion. The full-page capture confirmed the game remains a contained part of the sequential mobile reading flow rather than a separate screen.
