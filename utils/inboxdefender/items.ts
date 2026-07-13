// ============================================================
// INBOX DEFENDER — the mail that rains on your inbox.
// ============================================================
//
// The whole curriculum is one snap judgement: is this message a threat, or a
// real message? Malicious mail must be shot down; legitimate mail must be
// LET THROUGH. Every card carries the single cue the decision turns on (the
// `tag`), and a one-line `detail` — the micro-lesson shown the instant the
// item is resolved, and recapped in the debrief. `category` groups the tells.

export interface MailItem {
  id: number
  malicious: boolean
  from: string
  tag: string
  detail: string
  category: string
}

// ── threats: the tell is visible in the tag ──
const THREATS: Omit<MailItem, 'id'>[] = [
  { malicious: true, from: 'PayPal', tag: 'paypa1-secure.com', category: 'Lookalike domain', detail: "Lookalike domain — 'paypa1' with a one, not paypal.com." },
  { malicious: true, from: 'Your Bank', tag: 'standard-bank-alerts.co', category: 'Lookalike domain', detail: 'A bolt-on lookalike domain — not the real bank.' },
  { malicious: true, from: 'Amazon', tag: 'amaz0n-account.net', category: 'Lookalike domain', detail: "A zero for the 'o' — not amazon.com." },
  { malicious: true, from: 'Microsoft', tag: 'rnicrosoft-support.com', category: 'Homoglyph', detail: "'rn' imitates an 'm' — not microsoft.com. Read it letter by letter." },
  { malicious: true, from: 'Accounts', tag: 'Invoice_88213.exe', category: 'Dangerous attachment', detail: 'An invoice is never a .exe — that is a program that runs.' },
  { malicious: true, from: 'DHL', tag: 'DHL_Label.zip', category: 'Dangerous attachment', detail: 'Unexpected zipped "label" — a common malware wrapper.' },
  { malicious: true, from: 'Fax Service', tag: 'scan_document.scr', category: 'Dangerous attachment', detail: 'A .scr is an executable in disguise, not a scan.' },
  { malicious: true, from: 'IT Helpdesk', tag: 'Mailbox closes in 2h!', category: 'Urgency', detail: 'Manufactured urgency — engineered to make you act before thinking.' },
  { malicious: true, from: 'Netflix', tag: 'Confirm your password', category: 'Credential harvest', detail: 'No real service asks for your password by email.' },
  { malicious: true, from: 'HR', tag: 'Send your SSN now', category: 'Credential harvest', detail: 'Urgent request for sensitive data — a classic phish.' },
  { malicious: true, from: 'Lottery Board', tag: 'You won $1,500,000', category: 'Too good to be true', detail: 'You cannot win a draw you never entered.' },
  { malicious: true, from: 'CEO', tag: 'Buy gift cards, keep quiet', category: 'Business email compromise', detail: 'Gift-card + secrecy request — verify by another channel.' }
]

// ── safe mail: clean cues, nothing demanded ──
const SAFE: Omit<MailItem, 'id'>[] = [
  { malicious: false, from: 'Apple', tag: 'receipt from apple.com', category: 'Legitimate', detail: 'A genuine receipt from the real domain — let it through.' },
  { malicious: false, from: 'Calendar', tag: 'Invite: team standup', category: 'Legitimate', detail: 'An ordinary calendar invite — safe.' },
  { malicious: false, from: 'GitHub', tag: 'github.com sign-in alert', category: 'Legitimate', detail: 'A real security notice from the real domain — safe.' },
  { malicious: false, from: 'NY Times', tag: 'newsletter@nytimes.com', category: 'Legitimate', detail: 'A newsletter you subscribed to — safe.' },
  { malicious: false, from: 'HR', tag: 'Payslip in the portal', category: 'Legitimate', detail: 'Points you to the known portal and asks nothing — safe.' },
  { malicious: false, from: 'Slack', tag: 'New message in #general', category: 'Legitimate', detail: 'An ordinary app notification — safe.' },
  { malicious: false, from: 'Vendor', tag: 'invoice.pdf (known)', category: 'Legitimate', detail: 'A PDF invoice from a known vendor — safe.' },
  { malicious: false, from: 'Google', tag: 'Tip: turn on 2FA', category: 'Legitimate', detail: 'A helpful notice with no action demanded — safe.' },
  { malicious: false, from: 'Zoom', tag: 'Recording is ready', category: 'Legitimate', detail: 'A normal product notification — safe.' },
  { malicious: false, from: 'Bank', tag: 'Statement ready (app)', category: 'Legitimate', detail: 'Tells you to check the app — no link, no credentials — safe.' }
]

export const ITEMS: MailItem[] = [...THREATS, ...SAFE].map((it, i) => ({ ...it, id: i + 1 }))

/** A fresh shuffled round drawn from the full deck. */
export function buildRound(): MailItem[] {
  const deck = ITEMS.slice()
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export const ROUND_SIZE = ITEMS.length
