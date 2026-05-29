// Impossible Cube Navigation - 3D Isometric Section Cards
// Section navigation using CSS 3D transforms for cube-like appearance

class CubeNavigation {
  constructor() {
    this.isDesktop = window.matchMedia('(min-width: 840px)').matches;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.isDesktop || this.isReducedMotion) return;

    this.createCubeNav();
  }

  createCubeNav() {
    // Create cube navigation sidebar
    const nav = document.createElement('nav');
    nav.className = 'cube-nav';
    nav.setAttribute('aria-label', '3D Cube navigation');

    const sections = [
      { id: '#top', label: 'HERO', color: '#ff8c00' },
      { id: '#rant', label: 'RANT', color: '#ff6b6b' },
      { id: '#sandbox', label: 'SANDBOX', color: '#ffa500' },
      { id: '#tools', label: 'TOOLS', color: '#ffb366' },
    ];

    sections.forEach((section) => {
      const cube = document.createElement('button');
      cube.className = 'cube-nav__cube';
      cube.setAttribute('aria-label', `Navigate to ${section.label}`);
      cube.setAttribute('data-href', section.id);

      // Create 3D cube faces
      cube.innerHTML = `
        <div class="cube-nav__cube-inner">
          <div class="cube-nav__face cube-nav__face--front" style="background: ${section.color};">
            <span>${section.label}</span>
          </div>
          <div class="cube-nav__face cube-nav__face--back"></div>
          <div class="cube-nav__face cube-nav__face--right" style="background: ${section.color}; opacity: 0.7;"></div>
          <div class="cube-nav__face cube-nav__face--left" style="background: ${section.color}; opacity: 0.7;"></div>
          <div class="cube-nav__face cube-nav__face--top" style="background: ${section.color}; opacity: 0.5;"></div>
          <div class="cube-nav__face cube-nav__face--bottom" style="background: ${section.color}; opacity: 0.5;"></div>
        </div>
      `;

      cube.addEventListener('click', () => {
        const target = document.querySelector(section.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          this.activateCube(cube);
        }
      });

      nav.appendChild(cube);
    });

    document.body.appendChild(nav);

    // Update active cube on scroll
    window.addEventListener('scroll', () => {
      const cubes = nav.querySelectorAll('.cube-nav__cube');
      cubes.forEach((cube) => {
        const target = document.querySelector(cube.dataset.href);
        if (target) {
          const rect = target.getBoundingClientRect();
          const isActive = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
          cube.classList.toggle('cube-nav__cube--active', isActive);
        }
      });
    });
  }

  activateCube(cube) {
    const nav = document.querySelector('.cube-nav');
    nav.querySelectorAll('.cube-nav__cube').forEach((c) => {
      c.classList.remove('cube-nav__cube--active');
    });
    cube.classList.add('cube-nav__cube--active');
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CubeNavigation());
} else {
  new CubeNavigation();
}
