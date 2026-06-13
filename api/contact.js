// Vercel serverless function: contact form
// Wire up to Resend / SendGrid / Nodemailer
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, message } = req.body || {};
  if (!email || !message) return res.status(400).json({ error: 'Missing fields' });

  // TODO: replace with real email sender
  console.log('Contact form:', { name, email, message });

  return res.status(200).json({ ok: true });
}
