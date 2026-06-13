export function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        status.className = 'form-status success';
        status.textContent = 'Message sent! I'll get back to you soon.';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      status.className = 'form-status error';
      status.textContent = 'Something went wrong. Please try emailing directly.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send message';
    }
  });
}
