# Plain-language and ornamental-copy audit

## Audit standard

This audit removes **ornamental interface copy** without treating concise design as an excuse to remove information a visitor or learner needs. A text instance is retained when it serves at least one of these functions: it explains content, names a navigation destination, tells a person what an action does, supplies required context for a decision, reports a meaningful state or error, provides source or attribution information, or gives an assistive technology user an equivalent status.

An instance is a removal or rewrite candidate when it repeats an adjacent label, narrates an animation, adds atmosphere without explaining a page or action, uses an indirect slogan where a direct noun or verb would work, or restates an outcome already made clear by the heading, visual, control, or progress indicator.

| Test | Retain when | Remove or rewrite when |
|---|---|---|
| Task focus | It helps someone decide, navigate, learn, or complete an action. | It does not change what a person knows or can do next. |
| Plain language | It is specific, direct, audience-appropriate, and understandable on first reading. | It relies on vague uplift, filler, indirect framing, or a stylised synonym. |
| Information value | It introduces content, evidence, provenance, feedback, or a distinct state. | It duplicates nearby content, a visual label, or a control. |
| Accessibility | It conveys a status, change, error, focus shift, or visual meaning not otherwise exposed semantically. | It is decorative narration that adds no equivalent information. |
| Voice | It sounds like a person naming the thing or action at hand. | It sounds like generic brand theatre, empty reassurance, or a generated transition phrase. |

## Research basis

Digital.gov defines plain language as content that is clear and easy to understand and emphasises content written for its specific audience.[1] Microsoft’s interface-content guidance recommends concise, contextual, task-focused copy in which every word serves a purpose, while warning against overly effusive language and irrelevant content.[2] The VA design system cautions that excessive screen-reader announcements increase verbosity and cognitive load, and recommends retaining only announcements that communicate required state, context, or change.[3]

## Immediate decision

The runtime and first-paint preloaders retain an accessible `role="status"` and screen-reader-only preparation label. They remove the visible sentence **“Preparing a clearer way in”**, the visual rule, and the five ornamental ticks because the actual animated wordmark already provides the visual transition and the added elements neither identify a task nor report meaningful progress.

## References

[1]: https://digital.gov/guides/plain-language "Digital.gov: Plain language guide series"
[2]: https://learn.microsoft.com/en-us/power-platform/well-architected/experience-optimization/user-interface-content "Microsoft: Recommendations for writing user interface content"
[3]: https://design.va.gov/accessibility/when-a-screen-reader-needs-to-announce-content "VA Design System: When a screen reader needs to announce content"
