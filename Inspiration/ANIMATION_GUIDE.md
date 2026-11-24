# Animation & Interaction Technical Guide

## Overview
This guide documents the animation patterns and interaction techniques observed in the pacomepertant.com portfolio.

## Core Libraries

### GSAP (GreenSock Animation Platform)
- **Purpose**: Timeline-based animations and transitions
- **Key Features Used**:
  - Tweens for smooth property changes
  - Timelines for sequenced animations
  - Scroll triggers for scroll-based animations
  - Easing functions for natural motion

### Three.js
- **Purpose**: 3D graphics and WebGL rendering
- **Key Features Used**:
  - Scene management
  - Camera positioning
  - Material and lighting
  - Geometry transformations
  - Quaternion-based rotations

### Lenis
- **Purpose**: Smooth scrolling and scroll physics
- **Key Features Used**:
  - Velocity-based scroll behavior
  - Scroll event coordination
  - Physics simulation for natural feel

## Interaction Patterns

### 1. Sound-Driven Feedback
Every interaction triggers audio feedback:
- **Hover States**: `hover.ogg` (4.8KB)
- **Click Actions**: `click.ogg` (5.2KB)
- **Toggle Switches**: `switch.ogg` (37.5KB)
- **Menu Interactions**: Context-specific sounds
- **Ambient Background**: `ambient.ogg` continuous

**Implementation Pattern**:
```
User Action → Detect Event → Play Sound → Animate UI
```

### 2. View Mode Transitions
Portfolio supports dual view modes:
- **Spiral View**: 3D spiral gallery layout
- **List View**: Traditional list layout
- **Transition Sound**: Unique audio for each mode switch

**Animation Sequence**:
1. Trigger transition
2. Play mode-specific sound
3. Animate camera/layout change
4. Update DOM elements
5. Complete transition

### 3. Page Transitions
Smooth navigation between pages:
- **Fade/Dissolve**: Content transitions
- **Scroll Reset**: Smooth return to top
- **Loading State**: Animated loader during navigation

### 4. Scroll-Triggered Animations
Elements animate as they enter viewport:
- **Footer Scroll Transition**: Footer animates based on scroll position
- **Parallax Effects**: Depth-based scroll behavior
- **Lazy Loading**: Elements animate in on scroll

## Audio Asset Organization

### Interaction Sounds
| Asset | Size | Purpose |
|-------|------|---------|
| ambient.ogg | 300B | Background atmosphere |
| hover.ogg | 4.8KB | Hover feedback |
| click.ogg | 5.2KB | Click feedback |
| tick.ogg | 4.8KB | Notification/tick |
| spiral.ogg | 39.4KB | Spiral view transition |
| list.ogg | 37.9KB | List view transition |
| switch.ogg | 37.5KB | Toggle/switch sound |
| longclick.ogg | 28.7KB | Long press action |
| close.ogg | 10.8KB | Close/dismiss action |

### Contextual Sounds
- **Menu Interactions**: `homelink.ogg`, `aboutlink.ogg`
- **Emoji/Smiley**: `smiley1.ogg`, `smiley2.ogg`, `smiley3.ogg`

## Performance Optimizations

### Asset Delivery
- **OGG Format**: Efficient audio compression
- **Lazy Loading**: Sounds loaded on-demand
- **Code Splitting**: Multiple JS bundles for parallel loading
- **WebGL Hardware Acceleration**: GPU-based 3D rendering

### Animation Optimization
- **GPU Transforms**: Only animate `transform` and `opacity`
- **RequestAnimationFrame**: Synchronized with browser refresh
- **Debouncing**: Scroll events throttled to prevent jank
- **Memoization**: Cached calculations for repeated operations

## Building Similar Interactions

### Step 1: Setup Libraries
```javascript
import gsap from 'gsap';
import * as THREE from 'three';
import Lenis from '@studio-freight/lenis';
```

### Step 2: Initialize Scene (Three.js)
```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer({ antialias: true });
```

### Step 3: Create Animations (GSAP)
```javascript
const tl = gsap.timeline();
tl.to(element, { duration: 0.5, opacity: 1 })
  .to(element, { duration: 0.5, y: 20 }, 0.2);
```

### Step 4: Add Sound Feedback
```javascript
const sound = new Audio('path/to/sound.ogg');
element.addEventListener('click', () => {
  sound.currentTime = 0;
  sound.play();
  // Trigger animation
});
```

### Step 5: Integrate Smooth Scrolling (Lenis)
```javascript
const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

## Design Principles

### Motion Philosophy
1. **Physics-Based**: Animations follow natural acceleration/deceleration
2. **Purposeful**: Every animation serves a functional purpose
3. **Responsive**: Immediate feedback to user actions
4. **Contextual**: Different animations for different interaction types

### Easing Curves
- **Entrance**: Ease-out (fast start, slow end)
- **Exit**: Ease-in (slow start, fast end)
- **Continuous**: Ease-in-out (smooth throughout)

### Timing
- **Quick Feedback**: 100-200ms for immediate responses
- **Transitions**: 300-500ms for page/view changes
- **Ambient**: Continuous for background elements

## Common Patterns

### Pattern 1: Hover State
```
Hover → Play hover.ogg → Scale/color change → Smooth transition
```

### Pattern 2: Mode Switch
```
Click → Play mode-specific sound → Animate layout change → Update view
```

### Pattern 3: Scroll Trigger
```
Scroll → Detect element in viewport → Play animation → Fade/slide in
```

### Pattern 4: Loading State
```
Navigation → Show loader → Play ambient sound → Fade to new page
```

## Resources for Learning

- **GSAP Docs**: https://gsap.com/docs/
- **Three.js Docs**: https://threejs.org/docs/
- **Lenis Docs**: https://lenis.darkroom.engineering/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

**Note**: This guide is for learning animation techniques. Implement your own unique animations rather than copying exact sequences.
