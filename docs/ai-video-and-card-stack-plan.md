# AI Video Evidence and Directional Card-Stack Plan

## Selection rule

The course will use three short videos only, each on a distinct compact evidence screen. A video must introduce a visual phenomenon that is difficult to recreate with a static course image, answer one existing learning question, remain under three minutes, and have a visible source. Videos remain optional evidence: the learner can continue without playing them, and each screen states what to notice before the embed appears.

| Compact screen | Video | Duration | Teaching purpose | Learner viewing prompt |
|---|---|---:|---|---|
| Lesson 3 · Examples | [AI: What is Machine Learning?](https://www.youtube.com/watch?v=OeU5m6vRyCk), Code.org | 2:55 | Shows that machine learning learns patterns from data rather than following only written rules. | Watch to discover how machine learning differs from traditional programming by using vast data to recognize patterns and make predictions. |
| Lesson 5 · Real robot | [NASA’s Astrobee Robot First Free Flight in Space](https://www.youtube.com/watch?v=hk-1j3sXTqA), IEEE Spectrum with NASA footage | 1:32 | Makes camera-led autonomous motion visible in the real robotics example already used in the course. | Watch closely how the Astrobee robot uses its built-in cameras and sensors to independently navigate the zero-gravity space station environment. |
| Lesson 7 · Checkpoint | [AI: Training Data & Bias](https://www.youtube.com/watch?v=x2mRoFNm22g), Code.org | 2:40 | Gives a visual explanation of why training-data coverage matters before the responsible-use safeguard activity. | As you watch, carefully identify how the source and variety of training data directly impact the fairness of AI predictions. |

The course will not use the one-minute history candidate because its timeline omits key dates and AI winters while its visual treatment misrepresents early computing. The existing sourced timeline remains the historical learning activity.

## Learning prompts and caveats

| Video | Reflection immediately after viewing | Required course caveat |
|---|---|---|
| Machine learning | How could a narrow or uneven set of examples change the pattern a model learns? | Models do not have human-like comprehension; they identify statistical relationships within their training data. |
| Astrobee | Besides cameras, what other signals could help a robot navigate a shared physical space? | Footage demonstrates autonomous free flight, not the full underlying mapping or decision process. |
| Training data and bias | What could be missing from a school book-recommendation dataset, and how might that affect a learner? | Bias is not the only risk: data privacy, consent, appropriate use, evidence, and accountable review still matter. |

## Directional card-stack contract

Each course action creates the same spatial relationship. A **forward** action moves the departing card 18px left and slightly back before the next card rises from 28px right with a brief 0.985-to-1 scale settle. A **backward** action mirrors the route: the departing card moves 18px right while the prior card enters from 28px left. The player keeps a single rendered accessible screen; the outgoing impression is created with a non-interactive pseudo-layer and transform/opacity animation, not a duplicate focusable DOM tree.

The transition uses a 360ms emphasized ease, does not delay focus transfer, and fires for all screen-changing actions: course top-bar arrows, the primary Continue control, interactive substeps that advance prediction rounds, and restart. Under `prefers-reduced-motion: reduce`, all screen changes remain instant while the current heading receives focus as before.

## References

1. Code.org, “[AI: What is Machine Learning?](https://www.youtube.com/watch?v=OeU5m6vRyCk)” (2:55), analyzed for beginner concept fit and caveat.
2. IEEE Spectrum, “[NASA’s Astrobee Robot First Free Flight in Space](https://www.youtube.com/watch?v=hk-1j3sXTqA)” (1:32), footage credited to NASA.
3. Code.org, “[AI: Training Data & Bias](https://www.youtube.com/watch?v=x2mRoFNm22g)” (2:40), analyzed for data-coverage and responsibility framing.
