# BCS Steel

Premium industrial redesign of the existing dependency-free static website. Latvian is the default, with Russian and English static pages. No production deployment was made.

## Preview

Requires Node.js 20 or newer. There are no project dependencies to install.

```sh
node scripts/build.mjs
node scripts/serve.mjs
```

Open http://127.0.0.1:4173/ . Russian: `/ru/`; English: `/en/`. Stop with Ctrl+C. Run commands from this repository directory. The build writes `dist/` and regenerates root `index.html`, `ru/index.html`, `en/index.html`, `robots.txt` and `sitemap.xml`. Generated root pages also work when the repository is served over HTTP. Avoid opening ES modules through `file://`.

## Editing

- `js/content.js`: centralized translations, product categories, descriptions, form messages and SEO copy.
- `scripts/template.mjs`: semantic HTML shared by all language pages.
- `css/styles.css`, `css/fonts.css`: responsive styling and self-hosted Manrope fonts.
- `js/script.js`: theme, navigation, hero, carousel and form behavior.
- `js/media.js`: four poster/video configurations.
- `js/validation.js`: engineering drawing validation.
- `public/media/`: optimized assets, original downloaded photographs and generated product originals.
- `MEDIA_INVENTORY.md`, `MEDIA_PROVENANCE.json`: sources, dimensions, sizes and generation prompts.
- `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`: development, product and design guidance.

The complete optimized production directory is approximately 1.4 MB. Original gallery JPEGs and generated PNGs remain in the source repository and are excluded from `dist/`.

## Hero footage configuration

The four-slide hero currently displays image fallbacks. Company pages exposed one YouTube embed, not downloadable videos for each service. No direct MP4/WebM footage was obtained. This is a known unmet media requirement, not a completed four-video deliverable.

Put licensed, optimized clips under `public/media/laser/`, `bending/`, `welding/`, `fabrication/` and set each `video` in `js/media.js` to its local path, e.g. `media/bending/process.mp4`. Rebuild. Only the active video receives a source and plays; inactive clips pause. Reduced-motion, slow-connection/save-data users and autoplay errors retain posters. Videos are muted, looping, inline and `preload="none"`. The slideshow pauses on hover, focus, page hiding and leaving the viewport. Verify actual footage/autoplay on desktop and mobile after adding clips.

## Inquiry flow

The original project had only a `mailto:` form and no backend. The redesigned form validates required fields, email, consent and an optional engineering file (PDF/DXF/DWG/STEP/STP, nonempty, maximum 10 MiB). It opens an email draft addressed to the company website's verified email, `bcslasercut@gmail.com`. The visitor must attach the drawing in their email app and send it. Files and form details are never uploaded or stored by this site. The page discloses this before submission.

For direct website submissions, configure a backend with delivery credentials, server-side size/extension/content checks, secure attachment storage or forwarding, malware handling and abuse protection. Add an appropriate reviewed privacy notice and retention policy. Test actual receipt before claiming delivery. Never put mail credentials in client JavaScript.

## Tests

```sh
node --check js/script.js
node --check js/content.js
node --check scripts/build.mjs
node --test tests/site.test.mjs
```

The five Node tests cover locale completeness, semantic/SEO output, resource existence, removal of discontinued service copy and engineering file validation boundaries. There was no existing lint, typecheck or test setup; this remains plain JavaScript.

`tests/browser.mjs` is an optional Playwright regression script. It requires an installed `playwright` module and browser. Set `PLAYWRIGHT_MODULE` to an ESM module URL if using a bundled installation; set `BROWSER_EXECUTABLE` if using a system browser, then run `node tests/browser.mjs` while the server is running. The local desktop sandbox prevented the standalone browser from launching in this session. Connected-browser checks were used instead; see `DELIVERY_REPORT.md` for actual results. Email delivery and actual company video playback were not tested or claimed.

## Languages, accessibility and preferences

Locale links have real static URLs and preserve the selected page across reloads. Explicit choices are also stored in localStorage, without overriding shared URLs. Dark is the initial theme; light/dark preference persists when storage is available. Controls support keyboard use; the product track supports arrows, Home and End, plus native touch scrolling. Reduced motion disables decorative motion and automatic slide changes. Original logo and all factual company information are retained or sourced from the public company website; generated product imagery is visibly disclosed in every language.

## SEO and release

Build emits localized titles/descriptions, Open Graph, canonical/hreflang tags, organization JSON-LD, sitemap and robots.txt. Canonical domain is `https://bcslasercut.eu/`; update template and build together if the final domain changes. Hosting must serve static directory indexes and correct media MIME types. Old uppercase `/LV/`, `/RU/` URLs should receive redirects from hosting to `/` and `/ru/` during an eventual separately authorized release. Configure HTTPS and appropriate cache/security headers with the chosen hosting service. No deployment settings, domain routing or production files were changed by this task.

For a later reviewed deployment, use the contents of `dist/`. This repository also retains generated root pages for the previous static-root workflow. Do not deploy automatically.
