# Safari Preloader Audio Research

## Finding

An audible preloader narration cannot be made reliably automatic on iPhone Safari. Apple’s Safari guidance states that autoplay without a user gesture is limited to muted media or media without an audio track. The same restriction applies to programmatic `play()` calls and Web Audio contexts. [1] [2]

The practical, standards-aligned workaround is not an autoplay bypass. It is a direct, optional visitor gesture that starts the narration and unlocks the existing audio context. The visual preloader must still complete without sound if the visitor does not choose sound, or if the browser blocks it. This avoids the unreliable hidden-audio or delayed-timer workarounds discussed in older forum posts. [2] [3]

## Implementation Decision

The preloader will attempt audible playback once, as it does today. If that promise rejects with `NotAllowedError`, it will display a short, focused **Tap for sound** control over the existing wordmark sequence. The button will call `audio.play()` and resume the Web Audio context synchronously in its pointer/click handler. It will be available only while the preloader is present, will remain reachable by keyboard, and will disappear when sound starts or the preloader completes.

This does not delay page loading or trap a visitor in the preloader. The existing silent handoff remains available, and reduced-motion mode will retain its immediate silent presentation.

## References

[1]: https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari "Apple Developer: Delivering Video Content for Safari"
[2]: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay "MDN: Autoplay guide for media and Web Audio APIs"
[3]: https://stackoverflow.com/questions/31776548/why-cant-javascript-play-audio-files-on-iphone-safari "Stack Overflow: Why can't JavaScript play audio files on iPhone Safari?"
