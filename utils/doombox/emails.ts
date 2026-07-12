// ============================================================
// DOOMBOX — the threat specimens (the actual curriculum).
// ============================================================
//
// Ten emails live in the server. Each is a real-world phishing / malware
// pattern rendered faithfully enough that the learner has to READ it, not
// just click. Shooting a threat opens the inspector; the learner answers
// "what gave it away?" Answering IS spotting — every correct choice names a
// concrete element visible in the rendered mail. The `giveaway` line is the
// takeaway the debrief recaps.
//
// The ten cover ten distinct tells, so clearing the server teaches the full
// checklist: sender mismatch, lookalike links, urgency, dangerous
// attachments, generic greeting, too-good-to-be-true, homoglyph domains,
// credential harvesting, business-email-compromise, and malware droppers.

export interface Specimen {
  id: number
  kind: 'spam' | 'virus'
  /** what the reader sees as the sender name */
  from: string
  /** the real address behind the name */
  fromAddr: string
  subject: string
  body: string[]
  /** the primary call-to-action link; `href` is the REAL destination on hover */
  cta?: { text: string; href: string }
  attachment?: { name: string }
  /** the puzzle */
  question: string
  choices: string[]
  answer: number
  /** one-line lesson, shown on a correct answer and recapped in the debrief */
  giveaway: string
}

export const SPECIMENS: Specimen[] = [
  {
    id: 1,
    kind: 'spam',
    from: 'Standard Bank Security',
    fromAddr: 'security@standard-bank-alerts.co',
    subject: 'Unusual sign-in to your account',
    body: [
      'Dear Valued Customer,',
      'We detected a sign-in from a new device. If this was not you, verify your identity now to keep your account open.'
    ],
    cta: { text: 'Verify my account', href: 'http://standard-bank-alerts.co/verify' },
    question: 'What is the clearest sign this is a threat?',
    choices: [
      'The sender address is on standard-bank-alerts.co, not the real bank domain',
      'It mentions a new-device sign-in',
      'It is addressed to a customer',
      'It contains a button'
    ],
    answer: 0,
    giveaway: 'Look at the real sending domain — a bolt-on lookalike like "standard-bank-alerts.co" is not the bank.'
  },
  {
    id: 2,
    kind: 'spam',
    from: 'PayPal',
    fromAddr: 'service@paypal.com',
    subject: 'Your payment is on hold',
    body: [
      'Hello,',
      'A payment of $420.00 is on hold. Confirm your details within 24 hours or it will be reversed.'
    ],
    cta: { text: 'Resolve now', href: 'http://paypa1-secure.com/login' },
    question: 'The sender address looks right. What actually gives it away?',
    choices: [
      'The button links to paypa1-secure.com — a lookalike, not paypal.com',
      'PayPal never emails about payments',
      'The amount is too specific',
      'It says hello instead of using a name'
    ],
    answer: 0,
    giveaway: 'Hover the link, not the sender. "paypa1" (with a one) going to a bolt-on domain is the tell.'
  },
  {
    id: 3,
    kind: 'spam',
    from: 'IT Helpdesk',
    fromAddr: 'helpdesk@its-support-team.net',
    subject: 'ACTION REQUIRED: mailbox will be closed in 2 hours',
    body: [
      'Your mailbox has exceeded its storage limit and will be permanently deleted in 2 HOURS unless you act immediately.',
      'Reactivate now to avoid losing all your email.'
    ],
    cta: { text: 'Reactivate mailbox', href: 'http://its-support-team.net/reactivate' },
    question: 'What manipulation tactic is the core giveaway here?',
    choices: [
      'Manufactured urgency — a countdown that pressures you to act before thinking',
      'It mentions storage limits',
      'It comes from a helpdesk',
      'It uses capital letters somewhere'
    ],
    answer: 0,
    giveaway: 'Real IT does not threaten to delete your mailbox in 2 hours. Urgency is engineered to skip your judgement.'
  },
  {
    id: 4,
    kind: 'virus',
    from: 'Accounts Payable',
    fromAddr: 'billing@invoices-cloud.biz',
    subject: 'Invoice #INV-88213 overdue',
    body: [
      'Please find the overdue invoice attached. Open it to review the charges and avoid a late fee.'
    ],
    attachment: { name: 'Invoice_88213.exe' },
    question: 'What is the dangerous element?',
    choices: [
      'The attachment is a .exe — a program, not a document',
      'The invoice number is fake',
      'It mentions a late fee',
      'It has no greeting'
    ],
    answer: 0,
    giveaway: 'An invoice is never a .exe. An executable attachment is a program that runs — that is how droppers get in.'
  },
  {
    id: 5,
    kind: 'spam',
    from: 'Your Bank',
    fromAddr: 'no-reply@secure-bank-verify.com',
    subject: 'Please confirm your details',
    body: [
      'Dear Customer,',
      'For your security we need you to confirm your account details. This is a routine check.'
    ],
    cta: { text: 'Confirm details', href: 'http://secure-bank-verify.com/confirm' },
    question: 'A real bank knows who you are. What signals a fake here?',
    choices: [
      'The generic "Dear Customer" — your bank would use your name',
      'It says it is routine',
      'It is about security',
      'It came from no-reply'
    ],
    answer: 0,
    giveaway: 'Generic greetings ("Dear Customer") mean the sender does not actually know you — a mass phish, not your bank.'
  },
  {
    id: 6,
    kind: 'spam',
    from: 'International Lottery Board',
    fromAddr: 'claims@intl-lotto-winners.org',
    subject: 'CONGRATULATIONS! You have won $1,500,000',
    body: [
      'Your email address was selected in our international draw. To release your $1,500,000 prize, confirm your bank details and pay a small processing fee.'
    ],
    cta: { text: 'Claim my prize', href: 'http://intl-lotto-winners.org/claim' },
    question: 'What is the giveaway?',
    choices: [
      'Too-good-to-be-true prize plus an up-front fee to release it',
      'The prize amount is oddly specific',
      'It uses the word congratulations',
      'It arrived by email'
    ],
    answer: 0,
    giveaway: 'You cannot win a draw you never entered — and no real prize asks you to pay a fee to receive it.'
  },
  {
    id: 7,
    kind: 'spam',
    from: 'Microsoft Account Team',
    fromAddr: 'account@rnicrosoft-support.com',
    subject: 'Sign-in blocked',
    body: [
      'We blocked a sign-in attempt. Review the activity to restore full access to your account.'
    ],
    cta: { text: 'Review activity', href: 'http://rnicrosoft-support.com/review' },
    question: 'Read the domain letter by letter. What is wrong?',
    choices: [
      'It is "rnicrosoft" — the r+n imitates an m. Not microsoft.com',
      'Microsoft never blocks sign-ins',
      'The subject is too short',
      'It has a review button'
    ],
    answer: 0,
    giveaway: 'Homoglyphs: "rn" reads as "m" at a glance. Read suspicious domains one letter at a time.'
  },
  {
    id: 8,
    kind: 'spam',
    from: 'Netflix',
    fromAddr: 'billing@netflix-account-update.com',
    subject: 'Your membership is on hold',
    body: [
      'We could not process your payment. Update your payment method and password to reactivate your membership.'
    ],
    cta: { text: 'Update now', href: 'http://netflix-account-update.com/billing' },
    question: 'Beyond the domain, what request should never appear?',
    choices: [
      'It asks for your password — no legitimate service needs it by email',
      'It mentions a payment method',
      'It talks about membership',
      'It uses the word reactivate'
    ],
    answer: 0,
    giveaway: 'No real company asks for your password to "reactivate" anything. A password request is credential harvesting.'
  },
  {
    id: 9,
    kind: 'spam',
    from: 'Naveen Jose (CEO)',
    fromAddr: 'ceo.naveen@gmail-corp-exec.com',
    subject: 'Quick favour — are you at your desk?',
    body: [
      'I am in back-to-back meetings and need you to buy five $100 gift cards for a client. Send me the codes as soon as you have them. Keep this between us for now.'
    ],
    question: 'This impersonates your CEO. What is the giveaway?',
    choices: [
      'Gift-card request + secrecy from a personal-looking outside address',
      'The CEO is in meetings',
      'It asks if you are at your desk',
      'It is signed by a name'
    ],
    answer: 0,
    giveaway: 'Business-email-compromise: urgent gift cards, "keep it between us", from a look-alike outside address. Verify by another channel.'
  },
  {
    id: 10,
    kind: 'virus',
    from: 'DHL Express',
    fromAddr: 'tracking@dhl-parcel-notice.info',
    subject: 'Your parcel could not be delivered',
    body: [
      'Delivery failed because of an incomplete address. Download the attached delivery label and reschedule within 48 hours.'
    ],
    attachment: { name: 'DHL_Label.zip' },
    question: 'You were not expecting a parcel. What is the danger?',
    choices: [
      'An unexpected "label" as a .zip attachment — a common malware wrapper',
      'DHL never emails about parcels',
      'The address was incomplete',
      'It gives you 48 hours'
    ],
    answer: 0,
    giveaway: 'Unexpected delivery? Do not open the "label". Zipped attachments from parcel notices commonly hide malware.'
  }
]

export const specimenById = (id: number) => SPECIMENS.find((s) => s.id === id)
