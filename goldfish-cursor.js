(() => {
  // Goldfish Cursor - Phase 1: Canvas Rendering Foundation

  class GoldfishCursor {
    constructor() {
      // Prevent initialization on mobile or if reduced motion is enabled
      if (window.matchMedia('(pointer: coarse)').matches ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.canvas = null;
      this.ctx = null;
      this.mx = window.innerWidth / 2;
      this.my = window.innerHeight / 2;
      this.cx = this.mx;  // current x
      this.cy = this.my;  // current y
      this.friction = 0.18; // lerp factor (matches existing cursor)
      this.velocity = { x: 0, y: 0 };
      this.lastX = this.cx;
      this.lastY = this.cy;

      this.goldfish = {
        body: { x: 0, y: 0, width: 16, height: 12 }, // body blob
        head: { x: 8, y: 0, radius: 5 }, // rounded head
        tail: { length: 12, segmentCount: 3 }, // tail segments for undulation
        fins: { left: 0, right: 0 } // fin rotation angles
      };

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

      // Determine direction (angle) goldfish is facing
      const angle = Math.atan2(this.velocity.y, this.velocity.x);

      // Draw goldfish
      this.drawGoldfish(angle, speed);

      requestAnimationFrame(() => this.animate());
    }

    drawGoldfish(angle, speed) {
      this.ctx.save();
      this.ctx.translate(this.cx, this.cy);
      this.ctx.rotate(angle);

      // Draw body (rounded blob shape)
      this.ctx.fillStyle = '#FF6B35'; // Orange
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw head (rounded)
      this.ctx.fillStyle = '#FF8A50';
      this.ctx.beginPath();
      this.ctx.arc(8, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw eye
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(10, -1.5, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(11, -1.5, 1, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw tail (undulating based on speed)
      this.drawTail(speed);

      // Draw fins (animate based on speed)
      this.drawFins(speed);

      this.ctx.restore();
    }

    drawTail(speed) {
      const tailStartX = -10;
      const tailLength = 12;
      const undulationAmount = 2 + speed * 0.5;
      const undulationFreq = 0.15 + speed * 0.02;

      this.ctx.strokeStyle = '#FF6B35';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';

      // Draw tail as a curved path
      this.ctx.beginPath();
      this.ctx.moveTo(tailStartX, 0);

      for (let i = 0; i <= tailLength; i++) {
        const t = i / tailLength;
        const x = tailStartX - t * tailLength;
        const y = Math.sin(t * Math.PI + Date.now() * undulationFreq * 0.001) * undulationAmount;
        this.ctx.lineTo(x, y);
      }

      this.ctx.stroke();

      // Tail fin (fluke)
      this.ctx.fillStyle = '#FF8A50';
      const flukePosX = tailStartX - tailLength;
      this.ctx.beginPath();
      this.ctx.ellipse(flukePosX, 0, 4, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    drawFins(speed) {
      const finSize = 3 + speed * 0.3;
      const finDistance = 5;
      const finWave = Math.sin(Date.now() * 0.003) * 0.3;

      // Left fin
      this.ctx.fillStyle = 'rgba(255, 107, 53, 0.7)';
      this.ctx.beginPath();
      this.ctx.ellipse(-finDistance, -4, finSize, finSize * 1.5, -Math.PI / 4 + finWave, 0, Math.PI * 2);
      this.ctx.fill();

      // Right fin
      this.ctx.beginPath();
      this.ctx.ellipse(-finDistance, 4, finSize, finSize * 1.5, Math.PI / 4 - finWave, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new GoldfishCursor();
    });
  } else {
    new GoldfishCursor();
  }
})();
