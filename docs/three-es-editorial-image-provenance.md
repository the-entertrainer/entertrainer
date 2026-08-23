# Three Es and Elevate editorial image provenance

## First Elevate feature

The article **“If you are an intelligent person, life might not be easy for you. Here’s why”** now uses three real photographs selected for their relationship to the article’s central scenes of waiting, ambiguity, and reflection.

| Site usage | Managed asset | Source description | Source surfaced in research |
|---|---|---|---|
| Feature hero | `aQLfZtFcKJUyNvVk.jpg` | Person’s reflection in a bus window on a city street | Unsplash free photo result |
| Reflection break | `WqdJLFbfsztOTpSx.jpeg` | People on a bus stop in black and white | Free stock photo result |
| Closing break | `RSegpXnWnjysAAht.jpg` | Young Man Waiting In Prague | LibreShot free image result |

These files were downloaded from the image-research results, copied to `/home/ubuntu/webdev-static-assets/three-es/`, and uploaded through the managed web-asset flow before their URLs were added to the feature.

## Elevate banner

The `/elevate` moving-tile banner uses `oLmjqBPjwBxcOjsd.jpg`, a long-exposure city-lights photograph surfaced as a free Unsplash image result. It is intentionally separate from the article’s three photographs, so the banner has its own visual role.

## Browser validation

After replacing deployment-managed paths with public CDN URLs, the Elevate banner rendered the city-lights photograph behind its yellow moving-tile overlay. The first-feature card rendered the intended bus-window reflection photograph rather than the controlled paper fallback. The image URLs are also present as real `<img>` content in the rendered page text.

The full feature route was also reviewed after the correction. Its headline, real bus-window hero image, and all three cited image references rendered together in the e-magazine reading layout.

## Hierarchy validation notes

The rebuilt home, Elevate, and About Me routes render the new shared navigation: Elevate, Empower, Educate, Games, and About me. About Me now contains a dedicated SEWA Chronicles section with a working link to the preserved physical-reader route. Strong is absent from the shared navigation and the new home hierarchy.
