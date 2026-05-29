// Relative Motion Illusion - Time-Shifting Typography
// Hero text moves at different speeds creating perceptual time dilation

class MotionIllusion {
  constructor() {
    this.heroTitle = document.querySelector('.hero__title');
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.heroTitle || this.isReducedMotion) return;

    this.setupIllusion();
  }

  setupIllusion() {
    // Wrap each span in the hero title with individual animation delays
    const spans = this.heroTitle.querySelectorAll('.l');

    spans.forEach((span, index) => {
      // Get text and split into characters for fine control
      const text = span.textContent;
      span.innerHTML = '';

      text.split('').forEach((char, charIndex) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'motion-char';
        charSpan.textContent = char;

        // Calculate delay based on position
        // Left side slower, center faster, right side slower
        const totalChars = text.length;
        const position = charIndex / totalChars; // 0 to 1
        const centerDistance = Math.abs(position - 0.5);

        // Center chars animate faster (shortest delay)
        // Edge chars animate slower (longest delay)
        const baseDelay = centerDistance * 0.4;
        const lineDelay = index * 0.1;
        const totalDelay = baseDelay + lineDelay;

        charSpan.style.animationDelay = totalDelay + 's';
        charSpan.style.animationDuration = (0.8 + centerDistance * 0.4) + 's';

        span.appendChild(charSpan);
      });
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MotionIllusion());
} else {
  new MotionIllusion();
}
