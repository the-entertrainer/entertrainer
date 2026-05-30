(() => {
  // GIF-Based Mosquito Cursor with spring physics and realistic fly movement

  class MosquitoCursor {
    constructor() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const oldCursor = document.getElementById('cursor');
        if (oldCursor) oldCursor.style.display = 'none';
        return;
      }

      // Target position (mouse/touch)
      this.mx = window.innerWidth / 2;
      this.my = window.innerHeight / 2;

      // Current rendered position
      this.cx = this.mx;
      this.cy = this.my;

      // Spring velocity
      this.vx = 0;
      this.vy = 0;

      // Spring physics: lower stiffness = looser lag, lower damping = more overshoot
      this.spring = 0.055;
      this.damping = 0.78;

      // Smoothed velocity for tilting (tilt lags behind actual velocity)
      this.smoothVx = 0;
      this.smoothVy = 0;
      this.tiltSmoothingFactor = 0.15;  // 0-1; lower = smoother, slower response

      // Sinusoidal buzz wobble
      this.wobblePhase = 0;
      this.wobbleAmp = 2;     // max pixels of perpendicular wobble
      this.wobbleSpeed = 0.09; // phase advancement per frame at rest

      // Direction
      this.facingRight = true;

      // Scale
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
      this.scale = this.isMobile ? 0.175 : 0.225;

      // GIF image
      this.gifImg = null;
      this.gifLoaded = false;
      this.gifW = 0;
      this.gifH = 0;

      // Canvas
      this.canvas = null;
      this.ctx = null;

      this.init();
    }

    init() {
      // Remove any existing canvas to prevent duplicates
      const existing = document.getElementById('mosquito-cursor');
      if (existing) existing.remove();

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'mosquito-cursor';
      this.canvas.style.cssText = [
        'position:fixed', 'top:0', 'left:0',
        'pointer-events:none', 'z-index:9999',
        'cursor:none', 'display:block', 'visibility:visible'
      ].join(';');

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();

      // Hide old DOM cursor
      const oldCursor = document.getElementById('cursor');
      if (oldCursor) oldCursor.style.display = 'none';

      this.loadGif();

      this._onMouseMove = (e) => { this.mx = e.clientX; this.my = e.clientY; };
      this._onTouchMove = (e) => {
        if (e.touches && e.touches.length > 0) {
          this.mx = e.touches[0].clientX;
          this.my = e.touches[0].clientY;
        }
      };
      this._onResize = () => this.resizeCanvas();

      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('touchmove', this._onTouchMove, { passive: true });
      window.addEventListener('touchstart', this._onTouchMove, { passive: true });
      window.addEventListener('resize', this._onResize);

      this.animate();
    }

    loadGif() {
      this.gifImg = new Image();
      this.gifImg.onload = () => {
        this.gifW = this.gifImg.naturalWidth;
        this.gifH = this.gifImg.naturalHeight;
        this.gifLoaded = true;
      };
      this.gifImg.onerror = () => {
        console.error('MosquitoCursor: failed to load ./gifs/IMG_9426.gif');
      };
      this.gifImg.src = './gifs/IMG_9426.gif';
    }

    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Spring physics toward target
      this.vx += (this.mx - this.cx) * this.spring;
      this.vy += (this.my - this.cy) * this.spring;
      this.vx *= this.damping;
      this.vy *= this.damping;
      this.cx += this.vx;
      this.cy += this.vy;

      // Smooth velocity for tilting only (does not affect position)
      this.smoothVx += (this.vx - this.smoothVx) * this.tiltSmoothingFactor;
      this.smoothVy += (this.vy - this.smoothVy) * this.tiltSmoothingFactor;

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

      // Track previous speed for acceleration detection
      const acceleration = Math.abs(speed - (this.lastSpeed || 0));
      this.lastSpeed = speed;

      // Detect behavioral state based on movement speed
      let behaviorMode = 'hovering';
      if (speed > 0.5) behaviorMode = 'approach';
      if (speed > 3) behaviorMode = 'evasive';

      // Update facing direction only when moving meaningfully
      if (Math.abs(this.vx) > 0.15) {
        this.facingRight = this.vx > 0;
      }

      // Apply behavioral wobble multipliers
      let wobbleSpeedMult = 1.0;
      let wobbleAmpMult = 1.0;

      if (behaviorMode === 'hovering') {
        wobbleSpeedMult = 0.4;  // Slow, subtle wobble
        wobbleAmpMult = 0.3;
      } else if (behaviorMode === 'approach') {
        wobbleSpeedMult = 1.0;  // Normal
        wobbleAmpMult = 1.0;
      } else if (behaviorMode === 'evasive') {
        wobbleSpeedMult = 2.5;  // Fast, erratic
        wobbleAmpMult = 2.0;
        // Add random phase jump on high acceleration for erratic feel
        if (acceleration > 2) {
          this.wobblePhase += Math.random() * Math.PI * 0.5;
        }
      }

      // Wobble phase advances with behavioral multiplier (faster at higher speeds)
      this.wobblePhase += (this.wobbleSpeed * wobbleSpeedMult) + (speed * 0.04 * wobbleSpeedMult);

      // Perpendicular wobble offset (relative to travel direction)
      const travelAngle = Math.atan2(this.vy, this.vx);
      const wobbleMag = Math.sin(this.wobblePhase) * this.wobbleAmp * wobbleAmpMult * Math.min(speed / 4, 1.0);
      const drawX = this.cx + Math.cos(travelAngle + Math.PI / 2) * wobbleMag;
      const drawY = this.cy + Math.sin(travelAngle + Math.PI / 2) * wobbleMag;

      if (this.gifLoaded) {
        const halfW = (this.gifW * this.scale) / 2;
        const halfH = (this.gifH * this.scale) / 2;
        const clampedX = Math.max(halfW, Math.min(this.canvas.width - halfW, drawX));
        const clampedY = Math.max(halfH, Math.min(this.canvas.height - halfH, drawY));
        this.draw(clampedX, clampedY, speed);
      }

      requestAnimationFrame(() => this.animate());
    }

    draw(x, y) {
      const w = this.gifW * this.scale;
      const h = this.gifH * this.scale;

      // Gentle lean into direction of travel (max ~15°)
      // Use smoothed velocity for smoother tilting transitions
      const tiltAngle = Math.atan2(this.smoothVy, Math.abs(this.smoothVx)) * 0.3;
      const effectiveTilt = this.facingRight ? tiltAngle : -tiltAngle;

      this.ctx.save();
      this.ctx.translate(x, y);

      // Flip horizontally when facing left
      if (!this.facingRight) {
        this.ctx.scale(-1, 1);
      }

      this.ctx.rotate(effectiveTilt);
      this.ctx.drawImage(this.gifImg, -w / 2, -h / 2, w, h);
      this.ctx.restore();
    }

    destroy() {
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('touchmove', this._onTouchMove);
      window.removeEventListener('touchstart', this._onTouchMove);
      window.removeEventListener('resize', this._onResize);
      if (this.canvas) this.canvas.remove();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MosquitoCursor());
  } else {
    new MosquitoCursor();
  }
})();
