# Preloader Reimagining: Idea in Motion

## Intent

The preloader should feel like a tiny authored demonstration of Entertrainer’s purpose: a loose set of observations becomes a clear route. It remains finite and brief; it is not a progress indicator and must never extend the actual loading wait.

## Sequence

| Beat | Approximate window | Visual action |
|---|---:|---|
| Collect | 0–340ms | Three small paper observations enter from uneven positions and settle around the Entertrainer signal mark. |
| Connect | 280–880ms | A cobalt-violet route stitches the observations together, ending at a small completed dot. |
| Clarify | 700–1180ms | The five-bar signal resolves and the wordmark appears in a single measured wipe. |
| Hand off | 1100ms onward | The route completes and holds without looping until the application mounts. |

## Motion contract

Only opacity and transforms are animated. No animation loops; all beats complete in roughly 1.2 seconds. Under reduced motion, the observations, route, signal, and wordmark are visible immediately with no movement. The loader preserves its existing `role="status"` and loading label.
