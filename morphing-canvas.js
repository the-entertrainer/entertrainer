// Morphing Type Canvas - Cursor-Responsive Hero Typography
// Makes the hero h1 text dynamically warp based on cursor proximity

class MorphingCanvas {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.heroTitle = document.querySelector('.hero__title');
    if (!this.heroTitle) return;

    this.mouseX = 0;
    this.mouseY = 0;
    this.particles = [];
    this.isActive = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.isActive) return;

    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'morphing-canvas';
    this.ctx = this.canvas.getContext('2d');

    // Position canvas over hero title
    this.heroTitle.parentElement.style.position = 'relative';
    this.heroTitle.style.position = 'relative';
    this.heroTitle.parentElement.insertBefore(this.canvas, this.heroTitle);

    // Setup canvas size and position
    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Animation loop
    this.animate();
  }

  updateCanvasSize() {
    const rect = this.heroTitle.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const heroRect = this.heroTitle.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    // Calculate relative mouse position
    const relX = this.mouseX - canvasRect.left;
    const relY = this.mouseY - canvasRect.top;
    const distToMouse = Math.sqrt(relX * relX + relY * relY);
    const maxInfluence = 150; // pixels of influence

    // Get text from hero title
    const text = this.heroTitle.textContent.trim();
    const fontSize = parseInt(window.getComputedStyle(this.heroTitle).fontSize);
    const font = window.getComputedStyle(this.heroTitle).font;

    this.ctx.font = font;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // Very subtle overlay
    this.ctx.textBaseline = 'top';

    // Measure text width
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const x = (this.canvas.width - textWidth) / 2;
    const y = (this.canvas.height - fontSize) / 2;

    // Draw morphed text
    if (distToMouse < maxInfluence) {
      // Apply wave distortion only when cursor is near
      const influence = 1 - (distToMouse / maxInfluence);
      const waveAmount = influence * 8;

      // Character by character rendering with distortion
      let charX = x;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charMetrics = this.ctx.measureText(char);
        const charWidth = charMetrics.width;

        // Calculate distance from this character to cursor
        const charCenterX = charX + charWidth / 2;
        const charCenterY = y + fontSize / 2;
        const charDist = Math.sqrt(
          Math.pow(relX - charCenterX, 2) + Math.pow(relY - charCenterY, 2)
        );

        if (charDist < maxInfluence) {
          const charInfluence = 1 - (charDist / maxInfluence);
          const offsetX = Math.cos(charDist * 0.02) * waveAmount * charInfluence;
          const offsetY = Math.sin(charDist * 0.02) * waveAmount * charInfluence;
          const scaleInfluence = 1 + charInfluence * 0.05; // Subtle scale

          this.ctx.save();
          this.ctx.translate(charX + charWidth / 2, y + fontSize / 2);
          this.ctx.scale(scaleInfluence, scaleInfluence);
          this.ctx.translate(offsetX, offsetY);
          this.ctx.fillText(char, -charWidth / 2, -fontSize / 2);
          this.ctx.restore();
        } else {
          this.ctx.fillText(char, charX, y);
        }

        charX += charWidth;
      }
    }

    requestAnimationFrame(this.animate);
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MorphingCanvas());
} else {
  new MorphingCanvas();
}
