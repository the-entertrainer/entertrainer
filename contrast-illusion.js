// Simultaneous Contrast Illusion - Color Perception Demonstration
// Same color appears different based on surrounding background

class ContrastIllusion {
  constructor() {
    this.container = document.getElementById('contrast-illusion');
    if (!this.container) return;

    this.init();
  }

  init() {
    const revealed = this.container.dataset.revealed === 'false';

    this.container.addEventListener('click', () => {
      this.toggle();
    });

    // Add keyboard accessibility
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    if (!revealed) {
      this.container.setAttribute('role', 'button');
      this.container.setAttribute('tabindex', '0');
      this.container.setAttribute('aria-label', 'Click to reveal illusion explanation');
    }
  }

  toggle() {
    const isRevealed = this.container.dataset.revealed === 'true';
    this.container.dataset.revealed = !isRevealed;
    this.container.classList.toggle('contrast-illusion--revealed');
    this.container.setAttribute('aria-label',
      !isRevealed ? 'Illusion revealed' : 'Click to reveal illusion explanation'
    );
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContrastIllusion());
} else {
  new ContrastIllusion();
}
