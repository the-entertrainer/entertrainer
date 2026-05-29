(() => {
  // Realistic Mouse Cursor - Phase 2B: Photorealistic Top-Down Design

  class MouseCursor {
    constructor() {
      // Disable only if reduced motion is enabled
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.canvas = null;
      this.ctx = null;
      this.mx = window.innerWidth / 2;
      this.my = window.innerHeight / 2;
      this.cx = this.mx;  // current x
      this.cy = this.my;  // current y
      this.friction = 0.13; // Slower, more leisurely following (was 0.18 for goldfish)
      this.velocity = { x: 0, y: 0 };
      this.lastX = this.cx;
      this.lastY = this.cy;

      // Detect if mobile and set scale accordingly
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
      this.scale = this.isMobile ? 0.8 : 1; // 80% size on mobile

      // Position history for fluid tail ribbon
      this.positionHistory = [];
      this.maxHistoryLength = 18; // Number of points to track for tail
      this.historyInterval = 2; // Add position every N frames

      // Mouse colors
      this.colors = {
        bodyBase: '#D4A574',
        bodyLight: '#E8C9A8',
        bodyDark: '#A68968',
        tailDark: '#8B7355',
        earInner: '#E8B4B4',
        eye: '#000000',
        nose: '#E8B4B4'
      };

      this.frameCount = 0;

      this.init();
    }

    init() {
      // Create canvas element
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'goldfish-cursor';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      this.canvas.style.cursor = 'none';
      this.canvas.style.display = 'block';
      this.canvas.style.visibility = 'visible';

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      // Set canvas size
      this.resizeCanvas();

      // Hide the old cursor
      const oldCursor = document.getElementById('cursor');
      if (oldCursor) {
        oldCursor.style.display = 'none';
      }

      // Event listeners
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('touchmove', (e) => this.onTouchMove(e));
      window.addEventListener('touchstart', (e) => this.onTouchMove(e));
      window.addEventListener('touchend', () => this.onTouchEnd());
      window.addEventListener('resize', () => this.resizeCanvas());

      // Start animation loop
      this.animate();
    }

    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    onMouseMove(e) {
      this.mx = e.clientX;
      this.my = e.clientY;
    }

    onTouchMove(e) {
      // Track only the first touch (single touch only)
      if (e.touches && e.touches.length > 0) {
        this.mx = e.touches[0].clientX;
        this.my = e.touches[0].clientY;
      }
    }

    onTouchEnd() {
      // Keep current behavior
    }

    animate() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Lerp position (smooth following)
      this.lastX = this.cx;
      this.lastY = this.cy;
      this.cx += (this.mx - this.cx) * this.friction;
      this.cy += (this.my - this.cy) * this.friction;

      // Calculate velocity for animation feedback
      this.velocity.x = this.cx - this.lastX;
      this.velocity.y = this.cy - this.lastY;
      const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);

      // Determine direction (angle) mouse is facing
      const angle = Math.atan2(this.velocity.y, this.velocity.x);

      // Add current position to history for tail (every N frames)
      this.frameCount++;
      if (this.frameCount % this.historyInterval === 0) {
        this.positionHistory.push({ x: this.cx, y: this.cy });
        if (this.positionHistory.length > this.maxHistoryLength) {
          this.positionHistory.shift();
        }
      }

      // Draw mouse
      this.drawMouse(angle, speed);

      requestAnimationFrame(() => this.animate());
    }

    drawMouse(angle, speed) {
      this.ctx.save();
      this.ctx.translate(this.cx, this.cy);
      this.ctx.rotate(angle);
      this.ctx.scale(this.scale, this.scale);

      // Draw tail first (so it appears behind body)
      this.drawTail();

      // Draw body (main rounded shape)
      this.ctx.fillStyle = this.colors.bodyBase;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Body shading (darker edges for depth)
      const bodyGradient = this.ctx.createRadialGradient(0, 0, 3, 0, 0, 13);
      bodyGradient.addColorStop(0, this.colors.bodyLight);
      bodyGradient.addColorStop(1, this.colors.bodyDark);
      this.ctx.fillStyle = bodyGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw head (egg-shaped, slightly offset forward)
      this.ctx.fillStyle = this.colors.bodyBase;
      this.ctx.beginPath();
      this.ctx.ellipse(6, -1, 7, 9, 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Head shading
      const headGradient = this.ctx.createRadialGradient(6, -1, 2, 6, -1, 9);
      headGradient.addColorStop(0, this.colors.bodyLight);
      headGradient.addColorStop(1, this.colors.bodyDark);
      this.ctx.fillStyle = headGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(6, -1, 7, 9, 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw ears
      this.drawEar(-3, -10, -0.3); // Left ear
      this.drawEar(3, -10, 0.3);   // Right ear

      // Draw eyes (small black dots)
      this.ctx.fillStyle = this.colors.eye;
      this.ctx.beginPath();
      this.ctx.arc(3, -4, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(9, -3, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw eye shine (tiny white dots)
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(3.5, -4.3, 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(9.5, -3.3, 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw nose (small pink shape)
      this.ctx.fillStyle = this.colors.nose;
      this.ctx.beginPath();
      this.ctx.arc(11, -0.5, 0.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw whiskers (subtle fine lines)
      this.ctx.strokeStyle = this.colors.bodyDark;
      this.ctx.lineWidth = 0.5;
      this.ctx.lineCap = 'round';

      // Left whiskers
      this.ctx.beginPath();
      this.ctx.moveTo(10, -2);
      this.ctx.lineTo(16, -3);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(10, 0);
      this.ctx.lineTo(16, 0);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(10, 2);
      this.ctx.lineTo(16, 3);
      this.ctx.stroke();

      // Right whiskers
      this.ctx.beginPath();
      this.ctx.moveTo(10, -2);
      this.ctx.lineTo(16, -3);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(10, 0);
      this.ctx.lineTo(16, 0);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(10, 2);
      this.ctx.lineTo(16, 3);
      this.ctx.stroke();

      this.ctx.restore();
    }

    drawEar(x, y, rotation) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);

      // Outer ear (warm beige)
      this.ctx.fillStyle = this.colors.bodyBase;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 2.5, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner ear (pink)
      this.ctx.fillStyle = this.colors.earInner;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 1.2, 3.5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawTail() {
      if (this.positionHistory.length < 2) {
        return;
      }

      // Create smooth Bézier curve through historical positions
      this.ctx.strokeStyle = this.colors.bodyBase;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Start from back of body
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 0);

      // Draw curve through position history
      for (let i = 0; i < this.positionHistory.length; i++) {
        const pos = this.positionHistory[i];
        // Convert from world coords to local coords (relative to mouse center)
        const localX = pos.x - this.cx;
        const localY = pos.y - this.cy;

        if (i === 0) {
          this.ctx.lineTo(localX, localY);
        } else {
          // Use quadratic curve for smooth connections
          const prevPos = this.positionHistory[i - 1];
          const prevX = prevPos.x - this.cx;
          const prevY = prevPos.y - this.cy;
          const ctrlX = (prevX + localX) / 2;
          const ctrlY = (prevY + localY) / 2;
          this.ctx.quadraticCurveTo(ctrlX, ctrlY, localX, localY);
        }
      }

      this.ctx.stroke();

      // Draw tail with tapered width using shadow effect
      // Darker underside of tail for depth
      this.ctx.strokeStyle = this.colors.tailDark;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.4;

      this.ctx.beginPath();
      this.ctx.moveTo(-8, 1);

      for (let i = 0; i < this.positionHistory.length; i++) {
        const pos = this.positionHistory[i];
        const localX = pos.x - this.cx;
        const localY = pos.y - this.cy + 1;

        if (i === 0) {
          this.ctx.lineTo(localX, localY);
        } else {
          const prevPos = this.positionHistory[i - 1];
          const prevX = prevPos.x - this.cx;
          const prevY = prevPos.y - this.cy + 1;
          const ctrlX = (prevX + localX) / 2;
          const ctrlY = (prevY + localY) / 2;
          this.ctx.quadraticCurveTo(ctrlX, ctrlY, localX, localY);
        }
      }

      this.ctx.stroke();

      this.ctx.globalAlpha = 1;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new MouseCursor();
    });
  } else {
    new MouseCursor();
  }
})();
