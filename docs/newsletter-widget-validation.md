# Entertrainer Blogs newsletter widget validation

## Rendered index review

The widget renders after the first article and before the shared footer. It exposes a compact e-and-rings mark, the “The next issue” label, a clear feature headline, the email field’s visible purpose, a Subscribe control, and a short privacy line. The shared masthead and footer both show the Blogs link.

## Submission contract

The form posts the entered email to `/api/newsletter-subscribe`, a server route that adds the address to the "Entertrainer Weekly" MailerLite group using a server-only API key (`MAILERLITE_API_KEY`, set in Vercel project settings — never shipped to the client). A 422 from MailerLite (address already on the list) is treated as success from the visitor's point of view.

If `MAILERLITE_API_KEY` is not configured, or the request fails for any reason (network error, MailerLite outage), the widget falls back to its original behaviour: it opens a prepared `mailto:` message addressed to the site contact, and its status text says so before any information is implied to have been stored.

## Interaction review

The email field accepted a syntactically valid test address. On a successful MailerLite subscription the button reads "Sending…" while the request is in flight, then the status area shows `role="status"` feedback ("You're subscribed." / "You're already on the list.") and the field clears. On failure the same status area shows an error state (red-tinted) with a retry-friendly message, or — if the provider isn't configured at all — silently falls back to the mailto flow described above.
