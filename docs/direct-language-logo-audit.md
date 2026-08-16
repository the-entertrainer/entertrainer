# Direct language and logo audit

## Overall finding

The site’s current editorial style has been allowed to outrun its job of explaining itself. Several headings were memorable only after a visitor already knew the subject. A general visitor should be able to scan each page title and learn the topic immediately. The revised rule is simple: **name the subject first; use personality in the supporting sentence, example, or visual detail.**

| Area | Indirect or specialist wording | Direct replacement direction |
|---|---|---|
| Learning demonstration | “What gets designed when no one is watching” | “How to make instructions easier to follow” |
| Work index | “The work, opened up” | “Learning projects I’ve made” |
| Tool index | “Tools I built for L&D” | “Free tools for writing, planning, and quizzes” |
| Homepage proof section | “Things people could actually use” | “Featured projects” |
| Homepage tool section | “The boring bits, made quicker” | “Free tools that save time” |
| Laboratory index | “Fifteen homepages, one sheet of glass” | “Homepage design experiments” |
| Category metadata | “Practice”, “Story”, “Notes” | “Try a lesson”, “About me”, “How this site works” where these are public-facing route labels |

The individual project titles are largely allowed to retain their distinct character. **The SEWA Chronicles**, **Strong**, **StoryGen**, and **From No AI to Know AI** name recognizable pieces of work. The accompanying descriptions, however, should explain the topic plainly before offering any design-process language.

## Preloader mark assessment

The existing `public/logo.png` contains the original Entertrainer preloader identity: a lower-case white **entertrainer** wordmark over vertical violet-to-blue bands. Its visual memory is strong, but its full-screen gradient treatment conflicts with the calmer paper-and-ink website. The identity should retain the mark’s **lower-case friendliness, horizontal rhythm, and violet-to-blue transition**, but express them in a compact, flat, editorial system.

The redesigned system will use a text-first lower-case wordmark with a small five-bar signal mark. The five vertical bands refer directly to the preloader’s background, but they become a concise independent symbol for favicons, loading states, and tight spaces. A restrained violet-to-blue gradient is used only inside that small signal mark; interface buttons, content cards, and page backgrounds continue to use the site’s paper, ink, blue, red, green, and yellow system.

## Implementation rules

The wordmark must be readable at small sizes, have no generated or raster text, and remain accessible as selectable HTML text. The icon must be original SVG geometry, recognizable without the wordmark, and render equally on light and dark surfaces. All public page titles will be made direct before any decorative phrase is considered. No heading will require a visitor to infer the page’s actual topic.

## Implemented system

The public site now uses the lower-case **entertrainer** wordmark and the five-bar signal in the masthead, footer, pre-boot loading screen, and SVG favicon. Browser verification confirms that `/favicon.svg` is the active SVG icon and that the two visible shared wordmarks contain ten signal bars in total, five per mark.

Direct visible titles now include **How to make instructions easier to follow**, **Homepage design experiments**, **Free little tools I built**, **Things I’ve made for people to use**, and **From hotel floors to learning design**. Supporting headings and card metadata now name what is present, such as **Featured projects**, **Free tools that save time**, **Project story**, and **Free tool**, rather than requiring visitors to infer a category from a conceptual phrase.

The direct-language and identity update completed a full Nuxt/Vercel production build. The generated output includes the revised pre-boot template, SVG favicon, shared wordmark component, public-page metadata, and updated static files.
