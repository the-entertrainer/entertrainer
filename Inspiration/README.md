# Pacôme Pertant Portfolio - Technical Reference

This folder contains extracted technical assets and implementation details from the pacomepertant.com portfolio website, compiled for learning and reference purposes.

## Overview

**Website**: https://pacomepertant.com/
**Award**: Awwwards Site of the Day (June 9, 2026)
**Score**: 7.76/10
**Designers**: Louis Bocquet (PRO), Colin Demouge

## Tech Stack

- **Framework**: Nuxt.js 3 (Vue 3)
- **3D Graphics**: Three.js
- **Animation**: GSAP (GreenSock Animation Platform)
- **Smooth Scrolling**: Lenis
- **Styling**: Tailwind CSS (inferred)
- **Font**: Adobe Typekit (cxl5sdt)
- **Analytics**: PostHog

## Architecture

### Key Technologies

1. **Three.js**: Used for WebGL-based 3D rendering
   - Canvas element with WebGL context
   - Scene management with cameras and materials
   - 3D transformations and quaternions

2. **GSAP**: Animation library for timeline-based animations
   - Smooth transitions between UI states
   - Scroll-triggered animations
   - Timeline sequencing

3. **Lenis**: Smooth scrolling library
   - Global scroll management
   - Velocity-based animations
   - Scroll event coordination

4. **Nuxt.js**: Meta-framework for Vue 3
   - Server-side rendering capabilities
   - Automatic code splitting
   - Built-in routing

## Asset Structure

```
pacome_extracted/
├── scripts/              # Minified Vue/Nuxt components and libraries
│   ├── u9FHZ-Hh.js      # Main application bundle (contains Three.js, GSAP, Lenis)
│   ├── BBsoHOxw.js      # Supporting module
│   ├── oBQ-5twD.js      # Component module
│   ├── DzZlXN6j.js      # Utility module
│   ├── BKHIJojH.js      # Large bundle (750KB - likely Three.js + shaders)
│   ├── DP_CDnXU.js      # Additional module
│   └── BWUVe7QB.js      # Core library bundle
├── styles/              # CSS files
│   ├── entry.2njCuyBE.css    # Entry point styles
│   └── index.D4O3qLO1.css    # Page-specific styles
├── sounds/              # Audio assets for interactions
│   ├── ambient.ogg           # Background ambient sound
│   ├── hover.ogg             # Hover interaction sound
│   ├── click.ogg             # Click interaction sound
│   ├── spiral.ogg            # Spiral view transition sound
│   ├── list.ogg              # List view transition sound
│   ├── tick.ogg              # Tick/notification sound
│   ├── longclick.ogg         # Long click sound
│   ├── switch.ogg            # Switch/toggle sound
│   ├── close.ogg             # Close/dismiss sound
│   ├── menu/
│   │   ├── homelink.ogg      # Home link hover/click sound
│   │   └── aboutlink.ogg     # About link hover/click sound
│   └── smiley/
│       ├── smiley1.ogg       # Smiley emoji interaction 1
│       ├── smiley2.ogg       # Smiley emoji interaction 2
│       └── smiley3.ogg       # Smiley emoji interaction 3
├── images/              # Visual assets
│   ├── reel-thumbnail.png    # Showreel thumbnail
│   └── logo-big.png          # Large logo/branding
└── data/
    └── payload.json          # Nuxt hydration data (projects, metadata)
```

## Key Features Identified

### UI/UX Elements (from Awwwards)
- **Footer Scroll Transition**: Animated footer with scroll-based triggers
- **Loading Animation**: Sophisticated loading state
- **Mouse Trail**: Custom cursor trail effect
- **Menu Interactions**: Animated menu open/close with sound
- **List/Spiral View Toggle**: Dual layout modes with transitions
- **Page Transitions**: Smooth navigation between pages
- **Video Player**: Custom video playback interface
- **Gallery Transitions**: Spiral-to-list view morphing

### Design Characteristics
- **Color Palette**: Minimal (2 colors: #0a0a0a dark, #fafafa light)
- **Interaction Philosophy**: Sound-driven feedback on all interactions
- **Animation Style**: Smooth, physics-based transitions
- **Layout**: Responsive, centered content with asymmetric elements

## Audio Design

The website features comprehensive sound design:
- **Ambient**: Background atmospheric sound
- **Interactive**: Individual sounds for hover, click, toggle actions
- **Contextual**: Different sounds for different UI regions (menu, smiley, etc.)
- **Format**: OGG Vorbis (efficient, modern format)

## Content Structure

From the Nuxt payload, the portfolio contains:
- Multiple project entries with titles, descriptions, and metadata
- Behance links for each project
- Video assets (Mux video hosting)
- Style frame galleries
- Year/date information
- Social links (Instagram, X/Twitter, Behance, LinkedIn)

## Learning Points

### Animation Techniques
1. **Scroll-triggered animations**: GSAP with scroll events
2. **3D transformations**: Three.js for depth and perspective
3. **Smooth scrolling**: Lenis for physics-based scroll behavior
4. **Timeline sequencing**: GSAP timelines for coordinated animations

### Performance Optimizations
- Code splitting across multiple JS bundles
- Lazy loading of components
- Efficient asset delivery (OGG audio format)
- WebGL for hardware-accelerated 3D

### Interaction Patterns
- Sound feedback for all interactions
- Dual view modes (spiral/list)
- Smooth page transitions
- Responsive layout handling

## References

- **Awwwards Page**: https://www.awwwards.com/sites/pacome-pertant-portfolio
- **Three.js Docs**: https://threejs.org/docs/
- **GSAP Docs**: https://gsap.com/docs/
- **Lenis Docs**: https://lenis.darkroom.engineering/
- **Nuxt.js Docs**: https://nuxt.com/

## Usage Guidelines

This reference material is intended for:
- ✅ Learning animation and interaction techniques
- ✅ Understanding modern web architecture
- ✅ Studying sound design implementation
- ✅ Analyzing performance optimization strategies
- ✅ Building original projects inspired by similar principles

This material should NOT be used for:
- ❌ Direct copying of design or layout
- ❌ Reproducing the exact visual aesthetic
- ❌ Cloning the website functionality
- ❌ Commercial use without permission

## Notes

- All scripts are minified for production
- The main bundle (u9FHZ-Hh.js) contains the core animation logic
- Sound assets are organized by interaction type and region
- The Nuxt payload contains all project data in a structured format
- TypeKit font loading indicates use of premium typography

---

**Compiled**: June 14, 2026
**Purpose**: Technical reference and learning resource
