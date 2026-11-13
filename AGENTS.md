# BCS Steel instructions

Work on the existing static site. Preserve its sections, components, brand, dark/orange visual identity, factual claims, and original assets. Do not rewrite it or migrate to a framework without an explicit request.

## Workflow
1. Product Design: inspect the existing product and current evidence; agree the scope.
2. Impeccable: apply focused accessibility, layout, and resilience improvements within the approved identity.
3. Development: implement the agreed change incrementally.
4. Animate: use Impeccable's animate guidance for meaningful existing interactions; respect reduced motion, pause, visibility, keyboard and interruption.
5. Review Animations: review the implemented motion for accessibility, correctness, and performance. This is a workflow stage, not a claim that a skill with this exact name is installed. Check available skills; never install one implicitly.
6. Testing: run the relevant checks and report passes, failures, and unverified external services separately. Test during development as well; this final stage does not postpone necessary checks.

Do not install dependencies without authorization. Do not push or deploy without explicit authorization. Imported legacy media are candidates only: do not replace live/page assets automatically.

## Repository
- Each cloud task is isolated. Use this checkout; do not create a Git worktree unless requested.
- `index.html` is the Latvian source template; `js/script.js` contains the three translation dictionaries. Run `node scripts/build-locales.mjs` after edits to generate `ru/index.html`, `en/index.html`, metadata and sitemap. Verify a second run is unchanged.
- Run locally with `python3 -m http.server 8765 --bind 127.0.0.1`. There is no bundler and no production dependency installation.
- `python3 -m unittest discover -s tests -v` runs dependency-free repository checks. Browser tests require an already available Python Playwright and Chromium; see README. Do not install them automatically.
- `js/config.js` is public. Never put credentials there. Form delivery remains unverified until an approved HTTPS multipart endpoint and test recipient are provided. See `docs/FORM_SETUP.md`.
- Keep imported originals in `public/media/equipment`, `public/media/projects`, `public/media/videos`. Record source URLs, bytes, dimensions and hashes in `MEDIA_INVENTORY.md`. No upscaling or transcoding. On this static site `public/` is a literal directory, not a bundler public root.
