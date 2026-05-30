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
      this.mobileSpring = 0.015;  // Much softer for touch tracking (organic, not snappy)
      this.damping = 0.78;

      // Smoothed velocity for tilting (tilt lags behind actual velocity)
      this.smoothVx = 0;
      this.smoothVy = 0;
      this.tiltSmoothingFactor = 0.04;  // 0-1; lower = smoother, slower response (ultra-subtle)

      // Sinusoidal buzz wobble
      this.wobblePhase = 0;
      this.wobbleAmp = 2;     // max pixels of perpendicular wobble
      this.wobbleSpeed = 0.09; // phase advancement per frame at rest

      // Direction
      this.facingRight = true;

      // Wing micro-oscillations (figure-eight pattern during hovering)
      this.wingPhase = 0;

      // Orbital behavior (hunting interactive elements)
      this.orbitTarget = null;
      this.orbitAngle = 0;
      this.orbitRadius = 60;  // pixels from target center

      // Scale
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
      this.scale = this.isMobile ? 0.175 : 0.225;

      // Mobile touch offset (hover above finger instead of directly on it)
      this.touchOffsetY = -90;  // pixels above touch point (well clear of finger)

      // ---- Mini intelligence: life-like instincts (tuning) ----
      // All instincts produce a single bounded offset added to the spring's
      // target each frame; the spring stays the only integrator of cx/cy.
      this.instinctMax = 1.0;
      this.instinctEaseRate = 0.02;                  // how slowly intensity ramps (organic)
      this.instinctScale = this.isMobile ? 0.6 : 1;  // smaller mosquito darts shorter

      // Anticipation / lead (intercept the pointer instead of chasing)
      this.pointerVelSmooth = 0.15;  // EMA factor for measured pointer velocity
      this.leadFactor = 6.0;         // how many smoothed-velocity steps to lead ahead
      this.leadMax = 90;             // px hard cap on anticipation distance

      // Idle wandering / curiosity
      this.idleEnterMs = 900;        // pointer still this long before wandering eases in
      this.wanderAmp = 34;           // px radius of exploratory drift
      this.wanderEaseRate = 0.035;   // envelope ease in/out (no pop)
      this.wanderSpeedA = 0.013;     // layered angular speeds (irrational-ish ratios)
      this.wanderSpeedB = 0.022;
      this.wanderSpeedC = 0.007;

      // Standoff (never sit perfectly dead-center)
      this.standoffAmp = 6;          // px of permanent living offset
      this.standoffSpeed = 0.006;    // very slow orbit of the standoff point

      // Startle / evasive reflex (dart away from a swat)
      this.startleAccelThresh = 4.5; // pointer jerk magnitude that triggers a dart
      this.startleImpulse = 70;      // px peak perpendicular dart offset
      this.startleDecay = 0.86;      // per-frame decay (~15 frames to near-zero)
      this.startleRefractoryMs = 350;// min time between startles

      // Settling (instinct intensity ebbs after long idle)
      this.calmAfterIdleMs = 4000;
      this.calmFloor = 0.35;

      // ---- Mini intelligence: per-frame state ----
      this.instinct = 1.0;                       // master eased intensity (0..1)
      this.pmx = this.mx; this.pmy = this.my;    // previous raw pointer position
      this.pvx = 0; this.pvy = 0;                // smoothed pointer velocity (EMA)
      this.lastMoveTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      this.wanderPhaseA = Math.random() * 6.28;
      this.wanderPhaseB = Math.random() * 6.28;
      this.wanderPhaseC = Math.random() * 6.28;
      this.wanderEnv = 0;                        // eased 0..1 wandering envelope
      this.standoffPhase = Math.random() * 6.28;
      this.startleX = 0; this.startleY = 0;      // current decaying dart offset
      this.lastStartleTime = 0;

      // ---- Mobile smoothness: never interfere with scroll/zoom ----
      // During a scroll gesture or a pinch (multi-touch), the mosquito stops
      // tracking the finger and smoothly flies out through the nearest side,
      // then flies back in once the gesture ends. Listeners stay passive so the
      // browser's scroll/zoom is never blocked.
      this.isScrolling = false;
      this.multiTouch = false;
      this._scrollTimer = null;
      this.scrollHideMs = 200;   // time after the last scroll tick to consider it over
      this._retreating = false;  // currently flying out / staying out
      this.exitSide = 1;         // -1 = left edge, +1 = right edge (nearest at retreat start)
      this.allowOffscreen = false; // bypass the on-screen clamp while exiting / re-entering
      this.retreatMargin = 60;   // px past the edge the exit target sits (fully clears screen)
      this.retreatPhase = 0;     // sinusoid phase for organic curved exit motion

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

      this._onMouseMove = (e) => {
        this.mx = e.clientX; this.my = e.clientY;
        this.lastMoveTime = performance.now();  // real pointer move resets idle timer
      };
      this._onTouchMove = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        // Pinch-zoom (2+ fingers): freeze and hide so we never stagger the gesture.
        this.multiTouch = e.touches.length > 1;
        if (this.multiTouch) return;
        this.mx = e.touches[0].clientX;
        this.my = e.touches[0].clientY + this.touchOffsetY;  // Hover above finger
        this.lastMoveTime = performance.now();  // real pointer move resets idle timer
      };
      this._onTouchEnd = (e) => {
        // Reset the pinch flag once we're back to a single finger / no fingers.
        this.multiTouch = !!(e.touches && e.touches.length > 1);
      };
      // Passive scroll listener: while the page is scrolling, hide the mosquito
      // and let the render loop idle so scrolling stays perfectly smooth.
      this._onScroll = () => {
        this.isScrolling = true;
        if (this._scrollTimer) clearTimeout(this._scrollTimer);
        this._scrollTimer = setTimeout(() => { this.isScrolling = false; }, this.scrollHideMs);
      };
      this._onResize = () => this.resizeCanvas();
      this._onHoverEnter = (e) => {
        if (e.target.hasAttribute('data-cursor')) {
          this.orbitTarget = e.target;
        }
      };
      this._onHoverExit = (e) => {
        if (e.target.hasAttribute('data-cursor')) {
          this.orbitTarget = null;
        }
      };

      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('touchmove', this._onTouchMove, { passive: true });
      window.addEventListener('touchstart', this._onTouchMove, { passive: true });
      window.addEventListener('touchend', this._onTouchEnd, { passive: true });
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onResize);
      document.addEventListener('mouseover', this._onHoverEnter);
      document.addEventListener('mouseout', this._onHoverExit);

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

      // Mobile: while scrolling or pinch-zooming, the mosquito retreats off the
      // nearest horizontal edge instead of tracking the finger. Lock in the exit
      // side (and allow off-screen drawing) on the transition into retreat.
      const retreating = this.isMobile && (this.isScrolling || this.multiTouch);
      if (retreating && !this._retreating) {
        this.exitSide = (this.cx < this.canvas.width / 2) ? -1 : 1;
        this.allowOffscreen = true;
      }
      this._retreating = retreating;

      // Orbital behavior: hunt interactive elements with [data-cursor] attribute
      if (this.orbitTarget && !retreating) {
        const rect = this.orbitTarget.getBoundingClientRect();
        const targetX = window.scrollX + rect.left + rect.width / 2;
        const targetY = window.scrollY + rect.top + rect.height / 2;

        // Increment orbit angle for circular motion
        this.orbitAngle += 0.05;

        // Calculate orbital position around target (will be smoothed by spring physics)
        this.mx = targetX + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.my = targetY + Math.sin(this.orbitAngle) * this.orbitRadius;
      }

      // ---- Mini intelligence: compute a single bounded target offset ----
      // Instincts only re-aim the spring's target; they never touch cx/cy/vx/vy,
      // so this can never explode or double-integrate.
      const now = performance.now();
      const idleMs = now - this.lastMoveTime;
      const inOrbit = !!this.orbitTarget;

      // A. Measure pointer velocity (separate from spring velocity), EMA-smoothed.
      const rawDx = this.mx - this.pmx;
      const rawDy = this.my - this.pmy;
      this.pmx = this.mx; this.pmy = this.my;
      this.pvx += (rawDx - this.pvx) * this.pointerVelSmooth;
      this.pvy += (rawDy - this.pvy) * this.pointerVelSmooth;

      // B. Ease the master instinct intensity (settling after long idle).
      const instinctTarget = (idleMs > this.calmAfterIdleMs) ? this.calmFloor : this.instinctMax;
      this.instinct += (instinctTarget - this.instinct) * this.instinctEaseRate;

      // C. Anticipation / lead: aim ahead of where the pointer is heading.
      let leadX = this.pvx * this.leadFactor;
      let leadY = this.pvy * this.leadFactor;
      const leadLen = Math.hypot(leadX, leadY);
      if (leadLen > this.leadMax) {
        const k = this.leadMax / leadLen;
        leadX *= k; leadY *= k;
      }

      // D. Idle wandering / curiosity: drift on an organic path when pointer is still.
      const wantWander = (!inOrbit && idleMs > this.idleEnterMs) ? 1 : 0;
      this.wanderEnv += (wantWander - this.wanderEnv) * this.wanderEaseRate;
      this.wanderPhaseA += this.wanderSpeedA;
      this.wanderPhaseB += this.wanderSpeedB;
      this.wanderPhaseC += this.wanderSpeedC;
      const wRawX = Math.sin(this.wanderPhaseA) * 0.6
                  + Math.sin(this.wanderPhaseB * 1.3) * 0.3
                  + Math.cos(this.wanderPhaseC) * 0.4;
      const wRawY = Math.cos(this.wanderPhaseA * 0.9) * 0.6
                  + Math.sin(this.wanderPhaseB) * 0.3
                  + Math.sin(this.wanderPhaseC * 1.1) * 0.4;
      const wanderX = wRawX * this.wanderAmp * this.wanderEnv;
      const wanderY = wRawY * this.wanderAmp * this.wanderEnv;

      // E. Standoff: a permanent tiny living offset so it never sits dead-center.
      this.standoffPhase += this.standoffSpeed;
      const standoffX = Math.cos(this.standoffPhase) * this.standoffAmp;
      const standoffY = Math.sin(this.standoffPhase * 1.3) * this.standoffAmp;

      // F. Startle reflex: dart perpendicular on a sudden swat, then recover.
      const pointerAccel = Math.hypot(rawDx - this.pvx, rawDy - this.pvy);
      if (pointerAccel > this.startleAccelThresh &&
          (now - this.lastStartleTime) > this.startleRefractoryMs) {
        this.lastStartleTime = now;
        const ang = Math.atan2(this.pvy, this.pvx) + Math.PI / 2;
        const side = Math.random() < 0.5 ? 1 : -1;
        this.startleX = Math.cos(ang) * this.startleImpulse * side;
        this.startleY = Math.sin(ang) * this.startleImpulse * side;
      }
      this.startleX *= this.startleDecay;
      this.startleY *= this.startleDecay;

      // G. Compose the single offset. Lead/wander/standoff scale by eased instinct;
      // the startle reflex fires even when settled (added outside the multiply).
      const offX = (leadX + wanderX + standoffX) * this.instinct * this.instinctScale + this.startleX;
      const offY = (leadY + wanderY + standoffY) * this.instinct * this.instinctScale + this.startleY;
      let tx = this.mx + offX;
      let ty = this.my + offY;

      // Retreat override: glide off the nearest side with organic flutter. The same spring
      // carries it out (and, once the gesture ends, back to the finger) so both
      // the exit and the re-entry are smooth. Suppress instincts while leaving.
      if (retreating) {
        const margin = (this.gifW * this.scale) / 2 + this.retreatMargin;
        tx = this.exitSide < 0 ? -margin : this.canvas.width + margin;
        // Organic flutter during exit: gentle sinusoidal wobble as it leaves
        this.retreatPhase += 0.08;
        const flutterAmp = 12;  // px of vertical flutter during retreat
        ty = this.my + Math.sin(this.retreatPhase) * flutterAmp;
        this.startleX = 0; this.startleY = 0;  // no reflex while flying out
        this.pvx = 0; this.pvy = 0;            // clean slate for a calm re-entry
      } else {
        this.retreatPhase = 0;  // reset retreat phase when gesture ends
      }

      // Spring physics toward the (instinct- or retreat-) target
      // Use softer spring on mobile touch tracking for smooth, organic following
      const activeSpring = (this.isMobile && !retreating) ? this.mobileSpring : this.spring;
      this.vx += (tx - this.cx) * activeSpring;
      this.vy += (ty - this.cy) * activeSpring;
      this.vx *= this.damping;
      this.vy *= this.damping;
      this.cx += this.vx;
      this.cy += this.vy;

      // Smooth velocity for tilting only (does not affect position)
      this.smoothVx += (this.vx - this.smoothVx) * this.tiltSmoothingFactor;
      this.smoothVy += (this.vy - this.smoothVy) * this.tiltSmoothingFactor;

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

      // Track previous speed for acceleration detection
      this.acceleration = Math.abs(speed - (this.lastSpeed || 0));
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
        if (this.acceleration > 2) {
          this.wobblePhase += Math.random() * Math.PI * 0.5;
        }
      }

      // Wobble phase advances with behavioral multiplier (faster at higher speeds)
      this.wobblePhase += (this.wobbleSpeed * wobbleSpeedMult) + (speed * 0.04 * wobbleSpeedMult);

      // Micro-oscillations during hovering (figure-eight wing pattern)
      if (behaviorMode === 'hovering') {
        this.wingPhase += 0.1;  // Slow wing oscillation
      }

      // Perpendicular wobble offset (relative to travel direction)
      const travelAngle = Math.atan2(this.vy, this.vx);
      let wobbleMag = Math.sin(this.wobblePhase) * this.wobbleAmp * wobbleAmpMult * Math.min(speed / 4, 1.0);

      // Add wing micro-oscillations during hovering
      if (behaviorMode === 'hovering') {
        const wingFigureEight = Math.sin(this.wingPhase) * 0.5;
        const wingWobble = Math.cos(this.wingPhase * 2) * 0.3;
        wobbleMag += wingFigureEight + wingWobble;
      }

      const drawX = this.cx + Math.cos(travelAngle + Math.PI / 2) * wobbleMag;
      const drawY = this.cy + Math.sin(travelAngle + Math.PI / 2) * wobbleMag;

      if (this.gifLoaded) {
        const halfW = (this.gifW * this.scale) / 2;
        const halfH = (this.gifH * this.scale) / 2;
        // While exiting or re-entering, let it cross the edge freely; otherwise
        // keep normal flight inside the viewport.
        let outX = drawX, outY = drawY;
        if (!this.allowOffscreen) {
          outX = Math.max(halfW, Math.min(this.canvas.width - halfW, drawX));
          outY = Math.max(halfH, Math.min(this.canvas.height - halfH, drawY));
        }
        this.draw(outX, outY, speed);

        // Gesture over and fully back on-screen → resume clamping.
        if (this.allowOffscreen && !retreating &&
            drawX > halfW && drawX < this.canvas.width - halfW &&
            drawY > halfH && drawY < this.canvas.height - halfH) {
          this.allowOffscreen = false;
        }
      }

      requestAnimationFrame(() => this.animate());
    }

    draw(x, y) {
      const w = this.gifW * this.scale;
      const h = this.gifH * this.scale;

      // Tilt into direction of travel + intensity of acceleration
      // Use smoothed velocity for smooth transitions, add subtle acceleration component
      const velocityTilt = Math.atan2(this.smoothVy, Math.abs(this.smoothVx));
      const accelerationTilt = Math.min((this.acceleration || 0) * 0.02, 0.1);  // Minimal acceleration impact
      const tiltAngle = (velocityTilt + accelerationTilt) * 0.08;  // Ultra-subtle tilt (3.75x reduction)
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
      window.removeEventListener('touchend', this._onTouchEnd);
      window.removeEventListener('scroll', this._onScroll);
      window.removeEventListener('resize', this._onResize);
      if (this._scrollTimer) clearTimeout(this._scrollTimer);
      if (this.canvas) this.canvas.remove();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MosquitoCursor());
  } else {
    new MosquitoCursor();
  }
})();
