(() => {
  // Sprite-Based Isometric Mouse Cursor

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
      this.friction = 0.13;
      this.velocity = { x: 0, y: 0 };
      this.lastX = this.cx;
      this.lastY = this.cy;

      // Detect if mobile and set scale accordingly
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
      this.scale = this.isMobile ? 0.8 : 1;

      // Sprite sheet loading
      this.spriteNortheast = null;
      this.spriteSoutheast = null;
      this.spritesLoaded = false;
      this.frameCounter = 0;
      this.totalFrames = 8; // Default, will adjust based on sprite analysis
      this.frameWidth = 64; // Default, will adjust based on sprite dimensions
      this.frameHeight = 64; // Default, will adjust based on sprite dimensions
      this.animationSpeed = 0.15; // Frame advancement per unit velocity

      // Track which sprite is currently active
      this.currentSprite = 'northeast';

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

      // Load sprite sheets
      this.loadSprites();

      // Event listeners
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('touchmove', (e) => this.onTouchMove(e));
      window.addEventListener('touchstart', (e) => this.onTouchMove(e));
      window.addEventListener('touchend', () => this.onTouchEnd());
      window.addEventListener('resize', () => this.resizeCanvas());

      // Start animation loop
      this.animate();
    }

    loadSprites() {
      // Load northeast sprite (upward movement)
      this.spriteNortheast = new Image();
      this.spriteNortheast.crossOrigin = 'anonymous';
      this.spriteNortheast.onload = () => {
        this.calculateSpriteDimensions(this.spriteNortheast);
        this.checkSpritesReady();
      };
      this.spriteNortheast.src = './spritesheets/MrMouse-iso_walk_northeast.png';

      // Load southeast sprite (downward movement)
      this.spriteSoutheast = new Image();
      this.spriteSoutheast.crossOrigin = 'anonymous';
      this.spriteSoutheast.onload = () => {
        this.calculateSpriteDimensions(this.spriteSoutheast);
        this.checkSpritesReady();
      };
      this.spriteSoutheast.src = './spritesheets/MrMouse-iso_walk_southeast.png';
    }

    calculateSpriteDimensions(sprite) {
      if (sprite.width && sprite.height) {
        // Detect frame layout based on image dimensions
        const ratio = sprite.width / sprite.height;

        // Isometric sprites typically arranged horizontally in a strip
        // If width is much larger than height, it's a horizontal strip
        // Otherwise assume 8-frame grid or horizontal arrangement

        if (ratio > 2) {
          // Horizontal strip: width >> height
          // Likely 8 or more frames in a row
          this.totalFrames = 8; // Standard walk cycle
          this.frameWidth = sprite.width / this.totalFrames;
          this.frameHeight = sprite.height;
        } else if (ratio > 1.5) {
          // Wide horizontal strip with fewer frames
          this.totalFrames = 6;
          this.frameWidth = sprite.width / this.totalFrames;
          this.frameHeight = sprite.height;
        } else if (ratio < 1.2) {
          // Square-ish or taller: might be grid layout (4x2)
          this.totalFrames = 8;
          this.frameWidth = sprite.width / 4;
          this.frameHeight = sprite.height / 2;
        } else {
          // Default to 8-frame horizontal strip
          this.totalFrames = 8;
          this.frameWidth = sprite.width / 8;
          this.frameHeight = sprite.height;
        }

        // Debugging: log sprite dimensions
        console.log(`Sprite loaded - Dims: ${sprite.width}x${sprite.height}, Ratio: ${ratio.toFixed(2)}, Frames: ${this.totalFrames}, Frame size: ${this.frameWidth.toFixed(0)}x${this.frameHeight.toFixed(0)}`);
      }
    }

    checkSpritesReady() {
      if (this.spriteNortheast && this.spriteNortheast.complete &&
          this.spriteSoutheast && this.spriteSoutheast.complete) {
        this.spritesLoaded = true;
      }
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

      // Draw mouse sprite
      if (this.spritesLoaded) {
        this.drawSprite(angle, speed);
      }

      requestAnimationFrame(() => this.animate());
    }

    drawSprite(angle, speed) {
      // Determine which sprite to use based on angle
      // Northeast: moving upward (angle between -180° to 0°)
      // Southeast: moving downward (angle between 0° to 180°)
      let spriteToUse = this.spriteNortheast;

      if (angle > 0) {
        spriteToUse = this.spriteSoutheast;
        this.currentSprite = 'southeast';
      } else {
        this.currentSprite = 'northeast';
      }

      // Update frame counter based on speed
      // Faster movement = faster animation
      this.frameCounter += speed * this.animationSpeed;

      // Wrap frame counter
      const currentFrame = Math.floor(this.frameCounter) % this.totalFrames;

      // Calculate source rectangle (frame slicing)
      const sx = currentFrame * this.frameWidth;
      const sy = 0;
      const sw = this.frameWidth;
      const sh = this.frameHeight;

      // Draw sprite frame
      this.ctx.save();
      this.ctx.translate(this.cx, this.cy);
      this.ctx.scale(this.scale, this.scale);

      // Draw sprite centered at cursor position
      this.ctx.drawImage(
        spriteToUse,
        sx, sy, sw, sh,
        -this.frameWidth / 2, -this.frameHeight / 2,
        this.frameWidth, this.frameHeight
      );

      this.ctx.restore();
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
