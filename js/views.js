import { initSpiral } from './spiral.js';

export function initViews() {
  const btns = document.querySelectorAll('.view-btn');
  const containers = {
    spiral: document.getElementById('spiral-view'),
    grid: document.getElementById('grid-view'),
    list: document.getElementById('list-view'),
  };

  let spiralDestroy;
  let currentView = 'spiral';

  function switchView(view) {
    if (view === currentView) return;

    // Fade out current
    const prev = containers[currentView];
    if (prev) {
      prev.style.opacity = '0';
      prev.style.transition = 'opacity 0.25s';
      setTimeout(() => {
        prev.classList.remove('active');
        prev.style.opacity = '';
        prev.style.transition = '';
      }, 250);
    }

    if (currentView === 'spiral' && spiralDestroy) {
      spiralDestroy();
      spiralDestroy = null;
    }

    currentView = view;

    // Fade in next
    const next = containers[view];
    if (next) {
      next.style.opacity = '0';
      next.classList.add('active');
      requestAnimationFrame(() => {
        next.style.transition = 'opacity 0.35s';
        next.style.opacity = '1';
        setTimeout(() => { next.style.transition = ''; next.style.opacity = ''; }, 350);
      });
    }

    if (view === 'spiral') {
      spiralDestroy = initSpiral();
    }

    btns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Init spiral on first load
  spiralDestroy = initSpiral();
}
