# Pacôme Pertant Portfolio - Technical Reference Index

## Quick Start
This folder contains extracted technical assets from the award-winning portfolio website for learning and reference purposes.

**Start here**: Read `README.md` for overview, then explore specific guides based on your interest.

## Contents Overview

### Documentation Files
- **README.md** - Complete technical overview and architecture
- **ANIMATION_GUIDE.md** - Animation patterns, libraries, and implementation techniques
- **INDEX.md** - This file
- **FILE_MANIFEST.txt** - Complete file listing with sizes

### Asset Folders

#### `/scripts/` - JavaScript Bundles
7 minified Vue/Nuxt component bundles totaling ~3.6MB
- Main application logic
- Three.js integration
- GSAP animations
- Lenis smooth scrolling

#### `/styles/` - CSS Files
2 CSS files (~29KB total)
- Entry point styles
- Page-specific styles
- Tailwind CSS integration

#### `/sounds/` - Audio Assets
18 OGG Vorbis audio files (~1.3MB total)
- Interaction feedback sounds
- Contextual audio cues
- Menu and UI sounds
- Ambient background

#### `/images/` - Visual Assets
2 PNG images (~300KB total)
- Logo asset
- Showreel thumbnail

#### `/data/` - Content & Metadata
- `payload.json` - Nuxt hydration data structure
- `PAYLOAD_ANALYSIS.md` - Data architecture documentation

## Learning Paths

### Path 1: Animation Techniques
1. Read `ANIMATION_GUIDE.md`
2. Study `/scripts/` for implementation
3. Examine `/sounds/` for interaction patterns
4. Build your own animations using GSAP + Three.js

### Path 2: Architecture & Performance
1. Read `README.md` (Tech Stack section)
2. Review `data/PAYLOAD_ANALYSIS.md`
3. Analyze bundle structure in `/scripts/`
4. Study CSS organization in `/styles/`

### Path 3: Audio Design
1. Review sound files in `/sounds/`
2. Read `ANIMATION_GUIDE.md` (Audio Asset Organization)
3. Study interaction patterns
4. Implement sound feedback in your projects

### Path 4: Full Stack Understanding
1. Start with `README.md`
2. Review `ANIMATION_GUIDE.md`
3. Study `data/PAYLOAD_ANALYSIS.md`
4. Examine all asset folders
5. Build a similar portfolio with your own design

## Technology Stack Reference

| Technology | Purpose | File Location |
|------------|---------|---------------|
| Nuxt.js 3 | Framework | `/scripts/` |
| Vue 3 | UI Framework | `/scripts/` |
| Three.js | 3D Graphics | `/scripts/u9FHZ-Hh.js` |
| GSAP | Animations | `/scripts/u9FHZ-Hh.js` |
| Lenis | Smooth Scroll | `/scripts/u9FHZ-Hh.js` |
| Tailwind CSS | Styling | `/styles/` |
| Sanity.io | CMS | `data/payload.json` |
| Mux | Video Hosting | `data/payload.json` |

## Key Insights

### Performance
- Code splitting across 7 bundles
- Lazy loading of components
- OGG audio format for efficiency
- WebGL hardware acceleration

### Interaction Design
- Sound feedback on every interaction
- Dual view modes (spiral/list)
- Smooth page transitions
- Scroll-triggered animations

### Content Architecture
- Headless CMS (Sanity.io)
- Structured project data
- Video streaming (Mux)
- Image CDN optimization

## Usage Guidelines

✅ **Recommended Uses**:
- Learning animation techniques
- Understanding modern web architecture
- Studying sound design patterns
- Analyzing performance optimization
- Building original projects inspired by similar principles

❌ **Not Recommended**:
- Direct copying of design or layout
- Reproducing exact visual aesthetic
- Cloning functionality without modification
- Commercial use without permission

## File Statistics

```
Total Size: ~5.5MB
- Scripts: 3.6MB (7 files)
- Sounds: 1.3MB (18 files)
- Styles: 29KB (2 files)
- Images: 300KB (2 files)
- Data: ~100KB (documentation)
```

## Next Steps

1. **Choose a learning path** from above
2. **Read the relevant documentation**
3. **Study the asset structure**
4. **Implement your own version** with original design
5. **Build something unique** inspired by the techniques

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Documentation](https://gsap.com/docs/)
- [Lenis Documentation](https://lenis.darkroom.engineering/)
- [Nuxt.js Documentation](https://nuxt.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Last Updated**: June 14, 2026
**Purpose**: Technical reference and learning resource
**License**: For learning and reference only
