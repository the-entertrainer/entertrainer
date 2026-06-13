// Vercel serverless function: collect email before download
// Wire up to ConvertKit / Mailchimp by replacing the stub below
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // TODO: replace with real email provider (ConvertKit, Mailchimp, etc.)
  console.log('New subscriber:', { email, name });

  return res.status(200).json({ ok: true });
}
