// Velocity-Triggered Text Glitch - Scroll Speed Distortion
// Section headings and text distort based on scroll velocity

class ScrollGlitch {
  constructor() {
    this.lastScrollY = 0;
    this.scrollVelocity = 0;
    this.targetVelocity = 0;
    this.glitchElements = document.querySelectorAll('.stomp, h2, h3, h4');
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.isReducedMotion || this.glitchElements.length === 0) return;

    this.setupKeyframes();
    this.setupListeners();
  }

  setupKeyframes() {
    // Add glitch animation to style tag if not exists
    if (!document.getElementById('glitch-styles')) {
      const style = document.createElement('style');
      style.id = 'glitch-styles';
      style.textContent = `
        @keyframes glitch-shift {
          0%, 100% { text-shadow: none; transform: skewX(0deg); }
          20% { text-shadow: -2px 0 #ff8c00, 2px 0 rgba(0, 150, 255, 0.5); transform: skewX(-2deg); }
          40% { text-shadow: 2px 0 #ff8c00, -2px 0 rgba(0, 150, 255, 0.5); transform: skewX(2deg); }
          60% { text-shadow: -2px 0 #ff8c00, 2px 0 rgba(0, 150, 255, 0.5); transform: skewX(-2deg); }
          80% { text-shadow: 2px 0 #ff8c00, -2px 0 rgba(0, 150, 255, 0.5); transform: skewX(2deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupListeners() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      this.targetVelocity = Math.abs(currentScrollY - this.lastScrollY);
      this.lastScrollY = currentScrollY;

      // Update glitch effect
      this.updateGlitchEffect();

      // Clear timeout and reset velocity gradually
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.targetVelocity = 0;
        this.updateGlitchEffect();
      }, 100);
    }, { passive: true });

    // Continuous velocity lerp
    const velocityLoop = () => {
      this.scrollVelocity += (this.targetVelocity - this.scrollVelocity) * 0.15;
      this.updateGlitchEffect();
      requestAnimationFrame(velocityLoop);
    };
    requestAnimationFrame(velocityLoop);
  }

  updateGlitchEffect() {
    // Normalize velocity to 0-1 range (max 50px velocity = 1)
    const intensity = Math.min(this.scrollVelocity / 50, 1);

    this.glitchElements.forEach((el) => {
      if (intensity > 0.05) {
        // Apply glitch effects
        const duration = 0.4 + intensity * 0.2;
        const blurAmount = intensity * 3;
        const skewAmount = intensity * 4;

        el.style.filter = `blur(${blurAmount}px) contrast(${1 + intensity * 0.3})`;
        el.style.animation = `glitch-shift ${duration}s infinite`;
        el.style.willChange = 'filter, transform';

        // Random horizontal offset
        const offset = (Math.random() - 0.5) * intensity * 8;
        el.style.transform = `translateX(${offset}px) skewX(${skewAmount * (Math.random() - 0.5)}deg)`;
      } else {
        // Reset
        el.style.filter = 'none';
        el.style.animation = 'none';
        el.style.transform = 'none';
        el.style.willChange = 'auto';
      }
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ScrollGlitch());
} else {
  new ScrollGlitch();
}
