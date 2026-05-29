// Parallax Depth Diorama - Mouse-Position 3D Illusion
// Background elements shift position based on cursor X/Y, simulating depth

class ParallaxDiorama {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.container = null;
    this.layers = [];
    this.centerX = 0;
    this.centerY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isDesktop = window.matchMedia('(pointer: fine)').matches;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.hero || !this.isDesktop || this.isReducedMotion) return;

    this.init();
  }

  init() {
    // Create container for parallax elements
    this.container = document.createElement('div');
    this.container.className = 'parallax-diorama';
    this.hero.appendChild(this.container);

    // Create layered elements
    this.createLayers();
    this.updateCenterPoint();
    this.setupListeners();
    this.animate();
  }

  createLayers() {
    // Create 3 layers with different depths
    const depths = [
      { depth: 0.08, opacity: 0.15, scale: 1.2 },
      { depth: 0.15, opacity: 0.25, scale: 1.1 },
      { depth: 0.22, opacity: 0.35, scale: 1.0 },
    ];

    depths.forEach((config, index) => {
      const layer = document.createElement('div');
      layer.className = 'parallax-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.dataset.depth = config.depth;

      // Create decorative elements (dots, lines, shapes)
      for (let i = 0; i < 5 + index * 2; i++) {
        const element = this.createDecorativeElement();
        element.style.opacity = config.opacity;
        element.style.transform = `scale(${config.scale})`;
        layer.appendChild(element);
      }

      this.container.appendChild(layer);
      this.layers.push({
        element: layer,
        depth: config.depth,
        x: 0,
        y: 0,
      });
    });
  }

  createDecorativeElement() {
    const types = ['dot', 'line', 'circle'];
    const type = types[Math.floor(Math.random() * types.length)];
    const element = document.createElement('div');
    element.className = `parallax-element parallax-element--${type}`;

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    element.style.left = x + '%';
    element.style.top = y + '%';

    if (type === 'line') {
      element.style.width = Math.random() * 60 + 20 + 'px';
      element.style.height = '1px';
    } else if (type === 'circle') {
      const size = Math.random() * 40 + 10;
      element.style.width = size + 'px';
      element.style.height = size + 'px';
      element.style.borderRadius = '50%';
    } else {
      const size = Math.random() * 4 + 2;
      element.style.width = size + 'px';
      element.style.height = size + 'px';
      element.style.borderRadius = '50%';
    }

    element.style.backgroundColor = 'var(--orange)';
    element.style.pointerEvents = 'none';

    return element;
  }

  setupListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('resize', () => this.updateCenterPoint());
    this.updateCenterPoint();
  }

  updateCenterPoint() {
    const rect = this.hero.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }

  animate = () => {
    // Calculate offset from center
    const offsetX = (this.mouseX - this.centerX) / this.centerX;
    const offsetY = (this.mouseY - this.centerY) / this.centerY;

    // Apply to each layer with different depths
    this.layers.forEach((layer) => {
      const moveX = offsetX * layer.depth * 100; // in pixels
      const moveY = offsetY * layer.depth * 100;

      // Smooth lerp
      layer.x += (moveX - layer.x) * 0.1;
      layer.y += (moveY - layer.y) * 0.1;

      layer.element.style.transform = `translate(${layer.x}px, ${layer.y}px)`;
    });

    requestAnimationFrame(this.animate);
  };
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ParallaxDiorama());
} else {
  new ParallaxDiorama();
}
