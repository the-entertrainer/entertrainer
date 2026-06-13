export function initEmailGate() {
  const overlay = document.getElementById('email-gate-modal');
  if (!overlay) return;

  const form = overlay.querySelector('.modal__form');
  const closeBtn = overlay.querySelector('.modal__close');
  let pendingUrl = null;

  // Open modal when download is triggered
  document.querySelectorAll('[data-download]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      pendingUrl = btn.dataset.download;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      overlay.querySelector('input[type="email"]')?.focus();
    });
  });

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    pendingUrl = null;
  }

  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    const name = form.querySelector('input[name="name"]')?.value.trim() || '';
    const btn = form.querySelector('button[type="submit"]');

    if (!email) return;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      // POST to Vercel serverless function
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok || res.status === 409) {
        // Trigger download
        if (pendingUrl) {
          const a = document.createElement('a');
          a.href = pendingUrl;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        close();
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.textContent = 'Error — try again';
      btn.disabled = false;
    }
  });
}
