(() => {
  // Goldfish Cursor - Phase 2: Matter.js Physics Integration

  class GoldfishCursor {
    constructor() {
      // Disable only if reduced motion is enabled (but allow on mobile)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Matter.js modules
      this.Engine = Matter.Engine;
      this.World = Matter.World;
      this.Bodies = Matter.Bodies;
      this.Body = Matter.Body;
      this.Constraint = Matter.Constraint;
      this.Events = Matter.Events;

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

      // Detect if mobile and set scale accordingly
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
      this.scale = this.isMobile ? 0.8 : 1; // 80% size on mobile, 100% on desktop

      // Physics setup
      this.engine = this.Engine.create();
      this.engine.world.gravity.y = 0; // No gravity for floating effect
      this.engine.world.gravity.x = 0;

      // Tail bodies and constraints
      this.tailBodies = [];
      this.tailConstraints = [];
      this.tailSegments = 4; // Number of tail segments

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

      // Initialize tail bodies with constraints
      this.initTailPhysics();

      // Event listeners
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('touchmove', (e) => this.onTouchMove(e));
      window.addEventListener('touchstart', (e) => this.onTouchMove(e));
      window.addEventListener('touchend', () => this.onTouchEnd());
      window.addEventListener('resize', () => this.resizeCanvas());

      // Start animation loop
      this.animate();
    }

    initTailPhysics() {
      // Create tail segment bodies
      const segmentRadius = 2.5;
      const segmentSpacing = 3;

      for (let i = 0; i < this.tailSegments; i++) {
        const x = this.cx - (segmentSpacing * (i + 1));
        const y = this.cy;

        const body = this.Bodies.circle(x, y, segmentRadius, {
          friction: 0.5,
          restitution: 0.1,
          density: 0.001,
          label: `tail-${i}`
        });

        this.tailBodies.push(body);
        this.World.add(this.engine.world, body);
      }

      // Create distance constraints between segments
      for (let i = 0; i < this.tailBodies.length - 1; i++) {
        const constraint = this.Constraint.create({
          bodyA: this.tailBodies[i],
          bodyB: this.tailBodies[i + 1],
          length: segmentSpacing,
          stiffness: 0.95,
          damping: 0.01
        });

        this.tailConstraints.push(constraint);
        this.World.add(this.engine.world, constraint);
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
      // Track only the first touch (single touch only)
      if (e.touches && e.touches.length > 0) {
        this.mx = e.touches[0].clientX;
        this.my = e.touches[0].clientY;
      }
    }

    onTouchEnd() {
      // Optional: Could reset goldfish to center or make it follow slower
      // For now, just keep current behavior
    }

    updateTailPhysics() {
      // Move head body to follow cursor (with lerp)
      if (this.tailBodies.length > 0) {
        // Lerp position (smooth following)
        this.lastX = this.cx;
        this.lastY = this.cy;
        this.cx += (this.mx - this.cx) * this.friction;
        this.cy += (this.my - this.cy) * this.friction;

        // Calculate velocity for animation feedback
        this.velocity.x = this.cx - this.lastX;
        this.velocity.y = this.cy - this.lastY;

        // Move first tail segment toward cursor (simulates "head" of tail chain)
        const headSegment = this.tailBodies[0];
        const targetX = this.cx - 10; // Offset from cursor
        const targetY = this.cy;

        // Apply force to first segment to pull it toward cursor
        this.Body.setPosition(headSegment, {
          x: targetX,
          y: targetY
        });
      }
    }

    animate() {
      // Update physics
      this.Engine.update(this.engine);
      this.updateTailPhysics();

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Calculate velocity for animation feedback
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
      this.ctx.scale(this.scale, this.scale);

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

      // Draw tail (physics-driven)
      this.drawTail(speed);

      // Draw fins (animate based on speed)
      this.drawFins(speed);

      this.ctx.restore();
    }

    drawTail(speed) {
      // Draw lines connecting tail bodies from head to tail end
      this.ctx.strokeStyle = '#FF6B35';
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Start from head
      this.ctx.beginPath();
      this.ctx.moveTo(8, 0); // Head position

      // Draw line through each tail segment
      for (let i = 0; i < this.tailBodies.length; i++) {
        const body = this.tailBodies[i];
        const x = body.position.x - this.cx; // Relative to goldfish center
        const y = body.position.y - this.cy;
        this.ctx.lineTo(x / this.scale, y / this.scale); // Account for scale
      }

      this.ctx.stroke();

      // Draw tail fluke at the end
      if (this.tailBodies.length > 0) {
        const lastSegment = this.tailBodies[this.tailBodies.length - 1];
        const flukeX = lastSegment.position.x - this.cx;
        const flukeY = lastSegment.position.y - this.cy;

        this.ctx.fillStyle = '#FF8A50';
        this.ctx.beginPath();
        this.ctx.ellipse(flukeX / this.scale, flukeY / this.scale, 4, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
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
