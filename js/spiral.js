// Archimedean spiral layout with drag-to-rotate
export function initSpiral(items) {
  const canvas = document.querySelector('.spiral-canvas');
  if (!canvas || !items.length) return;

  const cards = canvas.querySelectorAll('.spiral-card');
  const N = cards.length;

  let rotation = 0;        // current global rotation in radians
  let targetRotation = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let velocityX = 0;
  let raf;

  // Spiral math: r = a + b*theta
  function spiralPos(i, totalAngle) {
    const a = 0;
    const b = 80;    // spacing between coils
    const thetaStep = (Math.PI * 2.2) / N;
    const theta = i * thetaStep + totalAngle;
    const r = a + b * (theta / (Math.PI * 2));
    return {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta) * 0.5,  // flatten Y for perspective feel
      z: Math.sin(theta) * 0.3 + 0.7  // scale factor for depth
    };
  }

  function render() {
    const cx = canvas.offsetWidth / 2;
    const cy = canvas.offsetHeight / 2;

    const positions = Array.from({ length: N }, (_, i) => spiralPos(i, rotation));

    // Sort by z for painter's algorithm
    const order = positions
      .map((p, i) => ({ ...p, i }))
      .sort((a, b) => a.z - b.z);

    order.forEach(({ x, y, z, i }) => {
      const card = cards[i];
      const scale = 0.6 + z * 0.45;
      card.style.transform =
        `translate(calc(${cx + x}px - 50%), calc(${cy + y}px - 50%)) scale(${scale})`;
      card.style.zIndex = Math.round(z * 10);
      card.style.opacity = 0.5 + z * 0.5;
    });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    if (!isDragging) {
      velocityX *= 0.92;
      targetRotation += velocityX * 0.008;
    }
    rotation = lerp(rotation, targetRotation, 0.1);
    render();
    raf = requestAnimationFrame(tick);
  }

  // Drag / touch handlers
  function onStart(x, y) {
    isDragging = true;
    lastX = x;
    lastY = y;
    velocityX = 0;
    canvas.style.cursor = 'grabbing';
  }

  function onMove(x) {
    if (!isDragging) return;
    const dx = x - lastX;
    velocityX = dx;
    targetRotation += dx * 0.01;
    lastX = x;
  }

  function onEnd() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup', onEnd);

  canvas.addEventListener('touchstart', e => {
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    onMove(e.touches[0].clientX);
  }, { passive: false });
  canvas.addEventListener('touchend', onEnd);

  // Auto-rotate gently when idle
  let idleTimer;
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // gentle auto-rotation
      velocityX = 0.8;
    }, 3000);
  }

  canvas.addEventListener('mousedown', resetIdle);
  canvas.addEventListener('touchstart', resetIdle, { passive: true });
  resetIdle();

  tick();

  return () => cancelAnimationFrame(raf);
}
