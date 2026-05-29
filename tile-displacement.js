// Interactive Tile Displacement - Hover Ripple Effects
// Work grid image tiles apply ripple/wave effects on mouse interaction

class TileDisplacement {
  constructor() {
    this.tiles = document.querySelectorAll('.wcard__img');
    this.ripples = new Map();
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.isReducedMotion || this.tiles.length === 0) return;

    this.init();
  }

  init() {
    this.tiles.forEach((tile, index) => {
      // Create a canvas overlay for each tile
      const canvas = document.createElement('canvas');
      canvas.className = 'tile-displacement-canvas';
      tile.parentElement.style.position = 'relative';
      tile.parentElement.insertBefore(canvas, tile);

      // Setup canvas
      const rect = tile.getBoundingClientRect();
      canvas.width = Math.ceil(rect.width);
      canvas.height = Math.ceil(rect.height);
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.opacity = '0';

      // Store ripple data
      this.ripples.set(tile, {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        rippleX: 0,
        rippleY: 0,
        rippleStrength: 0,
        particles: [],
      });

      // Add event listeners
      tile.addEventListener('mouseenter', (e) => this.startRipple(tile, e));
      tile.addEventListener('mousemove', (e) => this.updateRipple(tile, e));
      tile.addEventListener('mouseleave', (e) => this.stopRipple(tile));

      // Animate tile
      this.animateTile(tile);
    });
  }

  startRipple(tile, event) {
    const ripple = this.ripples.get(tile);
    if (!ripple) return;

    const rect = tile.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ripple.rippleX = x;
    ripple.rippleY = y;
    ripple.rippleStrength = 0;

    // Apply filter effect to tile
    tile.style.filter = 'brightness(1.2) contrast(1.1)';
    tile.style.transform = 'scale(1.02)';

    // Create particle effect
    for (let i = 0; i < 8; i++) {
      ripple.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        size: Math.random() * 4 + 2,
      });
    }
  }

  updateRipple(tile, event) {
    const ripple = this.ripples.get(tile);
    if (!ripple) return;

    const rect = tile.getBoundingClientRect();
    ripple.rippleX = event.clientX - rect.left;
    ripple.rippleY = event.clientY - rect.top;
    ripple.rippleStrength = Math.min(ripple.rippleStrength + 0.05, 1);
  }

  stopRipple(tile) {
    const ripple = this.ripples.get(tile);
    if (!ripple) return;

    tile.style.filter = 'none';
    tile.style.transform = 'none';
    ripple.rippleStrength = 0;
  }

  animateTile(tile) {
    const ripple = this.ripples.get(tile);
    if (!ripple) return;

    const animate = () => {
      // Clear canvas
      ripple.ctx.clearRect(0, 0, ripple.canvas.width, ripple.canvas.height);

      // Update and draw particles
      ripple.particles = ripple.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.02;

        if (p.life > 0) {
          ripple.ctx.fillStyle = `rgba(255, 140, 0, ${p.life * 0.3})`;
          ripple.ctx.beginPath();
          ripple.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ripple.ctx.fill();
          return true;
        }
        return false;
      });

      // Draw ripple rings
      if (ripple.rippleStrength > 0) {
        const maxRadius = 100 * ripple.rippleStrength;
        ripple.ctx.strokeStyle = `rgba(255, 140, 0, ${0.3 * ripple.rippleStrength})`;
        ripple.ctx.lineWidth = 2;

        for (let r = 10; r < maxRadius; r += 20) {
          ripple.ctx.beginPath();
          ripple.ctx.arc(ripple.rippleX, ripple.rippleY, r, 0, Math.PI * 2);
          ripple.ctx.stroke();
        }

        ripple.rippleStrength *= 0.95;
        ripple.canvas.style.opacity = Math.max(ripple.rippleStrength * 0.5, ripple.particles.length > 0 ? 1 : 0);
      } else {
        ripple.canvas.style.opacity = ripple.particles.length > 0 ? 1 : 0;
      }

      requestAnimationFrame(animate);
    };

    animate();
  };
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TileDisplacement());
} else {
  new TileDisplacement();
}
