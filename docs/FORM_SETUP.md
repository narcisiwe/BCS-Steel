# Enquiry delivery — external prerequisite

The static GitHub Pages site cannot receive uploads or send email by itself. No server, account, mailbox or privacy policy has been invented or provisioned.

Current default: clearly labelled **Prepare email** opens the visitor's mail application. The visitor must attach the drawing manually. No success/delivery claim is made. The existing email address is reused from the original site and still needs owner confirmation.

To enable online delivery, configure `formEndpoint` in `js/config.js` with an owner-approved HTTPS endpoint. No credentials may be exposed in this file.

## Endpoint contract
- Accept `POST multipart/form-data`: name, company, email, phone, service (laser/bending/welding/turning/other), message, optional drawing, language.
- Support CORS from the approved site origin (GitHub Pages origin is `https://narcisiwe.github.io`).
- Return 2xx only after accepting/storing the enquiry; the browser reports acceptance, not mailbox delivery. Return 4xx/5xx for rejected requests.
- Validate all inputs server-side; verify file contents and size (browser limit: 10 MiB), sanitize filenames, apply rate limits, keep uploads private, and define retention/deletion rules. A filename extension alone is insufficient.
- Before release, owner must confirm recipient, processor, privacy information and retention policy. Add accurate privacy text once supplied; do not invent a legal policy.

## Acceptance test (requires owner approval)
Send a test enquiry with a small drawing to the approved recipient; confirm actual receipt, readable data and the exact attachment. Check rejection, offline, timeout, large/invalid file, retry, and double-submit behavior. Mock browser tests cover the client integration only and do not prove delivery.
