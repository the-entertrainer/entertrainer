// Fibonacci Spiral Navigation - Hypnotic Golden Ratio Layout
// Section indicators arrange in Fibonacci spiral, rotating with scroll

class FibonacciNav {
  constructor() {
    this.sections = document.querySelectorAll('[data-screen-label]');
    this.isDesktop = window.matchMedia('(min-width: 840px)').matches;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.isDesktop || this.isReducedMotion || this.sections.length === 0) return;

    this.init();
  }

  init() {
    // Create navigation container
    this.nav = document.createElement('nav');
    this.nav.className = 'fibonacci-nav';
    this.nav.setAttribute('aria-label', 'Section spiral navigation');
    document.body.appendChild(this.nav);

    // Create indicator dots
    this.indicators = [];
    this.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'fibonacci-dot';
      dot.setAttribute('aria-label', `Navigate to ${section.dataset.screenLabel}`);
      dot.setAttribute('data-section', index);
      dot.textContent = index + 1;

      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });

      this.nav.appendChild(dot);
      this.indicators.push({
        element: dot,
        section: section,
        x: 0,
        y: 0,
      });
    });

    this.updateLayout();
    window.addEventListener('resize', () => this.updateLayout());
    window.addEventListener('scroll', () => this.updateActive());
    this.animate();
  }

  updateLayout() {
    const centerX = window.innerWidth * 0.15;
    const centerY = window.innerHeight * 0.5;
    const baseRadius = 80;

    // Fibonacci sequence for positioning
    const fibonacci = [1, 1, 2, 3, 5, 8, 13];

    this.indicators.forEach((indicator, index) => {
      const fibValue = fibonacci[index % fibonacci.length];
      const angle = (index * 137.5) * (Math.PI / 180); // Golden angle
      const radius = baseRadius + fibValue * 15;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      indicator.x = x;
      indicator.y = y;
      indicator.targetAngle = angle;

      indicator.element.style.position = 'fixed';
      indicator.element.style.left = x + 'px';
      indicator.element.style.top = y + 'px';
      indicator.element.style.zIndex = 900 + index;
    });
  }

  updateActive() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    this.indicators.forEach((indicator, index) => {
      const rect = indicator.section.getBoundingClientRect();
      const isInView = rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5;

      indicator.element.classList.toggle('fibonacci-dot--active', isInView);
    });
  }

  animate = () => {
    const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const rotation = scrollProgress * 360; // Full rotation per page scroll

    this.indicators.forEach((indicator, index) => {
      const pulse = Math.sin(Date.now() * 0.005 + index * 0.5) * 0.1 + 1;
      indicator.element.style.transform = `rotate(${rotation}deg) scale(${pulse})`;
    });

    requestAnimationFrame(this.animate);
  };
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FibonacciNav());
} else {
  new FibonacciNav();
}
