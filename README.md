# BCS Steel

Existing industrial website, updated without changing its visual identity. Dark-only static HTML/CSS/JavaScript with local GSAP core for the two About image carousels. Latvian is the default; Russian and English are centralized in `js/content.js`.

## Preview and build

From this directory, with Node.js 20+:

```sh
npm ci
node scripts/build.mjs
node scripts/serve.mjs
```

Open http://127.0.0.1:4173/ . Stop with Ctrl+C. `dist/` contains the production static files, including local GSAP core; hosting needs no npm or CDN connection. The build also regenerates root, `ru/` and `en/` HTML pages for static-root hosting. Use HTTP, not `file://`, for JavaScript modules.

## Update behavior

- The hero uses one animation-frame clock for seven-second dwell/progress, a 1100 ms overlapping crossfade, alternating Ken Burns movement and staggered copy entrances. Manual changes reset progress; Pause preserves elapsed time and slideshow motion. Hidden pages, an offscreen hero, open lightboxes and reduced motion suspend automatic changes. Reduced motion retains a short manual fade without spatial movement. Inactive videos pause.
- Language controls render all content in place, update `html.lang` and localized metadata, use query URLs that work under nested hosting paths, and persist the choice when storage is available. Current slide, form values, attachment selection and carousel positions survive switching. Static locale URLs also remain available for indexing.
- Two About galleries use real company work photographs and explicitly labeled existing product illustrations on elliptical GSAP displays. `data-seconds="50"` configures revolution speed. Pointer entry/movement, drag, focus and arrows pause autoplay; rotation resumes after ten seconds without interaction once focus/drag is released. Each gallery has a persistent pause control. Hidden/offscreen and reduced-motion displays suspend autoplay. Locale changes preserve phase and pause. Full-resolution lightboxes remain available. See `GALLERY_IMAGES.md` for every source.
- HSG G3015X replaces the previous laser machine. Its unverified technical specifications are omitted. The existing image shows production details, not an asserted photograph of that machine. Other verified equipment information remains.
- Name, email, phone, description, service and consent are required; company and drawing are optional. Phone validation accepts international formatting and 7–15 digits, excluding an initial international `00` access prefix. Files remain limited to nonempty PDF/DXF/DWG/STEP/STP files up to 10 MiB.

## Inquiry delivery and video limitations

The existing project has no backend. A valid inquiry prepares a `mailto:` draft to `bcslasercut@gmail.com`. The visitor must attach their drawing in their mail app and send it. The page explains this; it never claims server upload or successful receipt. No data is stored by the website. Direct delivery would require a separately configured, secure backend with server-side validation and receipt tests.

The imported redesign contains poster images and a video-capable engine, but no actual direct video clips (`js/media.js` has null video values). This update preserves that configuration and all existing media. To enable real footage, supply licensed optimized local clips, set the corresponding `video` paths and rebuild. Muted inline playback, lazy source assignment, inactive-video pausing and poster fallback remain. Actual video playback cannot be verified until footage exists.

## Source

- `js/content.js`: all LV/RU/EN copy and validation/accessibility labels.
- `js/render.js`: shared static/client renderer; `scripts/template.mjs` re-exports it for builds.
- `js/script.js`: runtime lifecycle, navigation, localization, galleries, lightbox and form.
- `js/hero.js`: poster/video preparation, clock-driven cinematic motion and hero controls.
- `js/slideshow-clock.js`: single slideshow timeline.
- `js/validation.js`: phone/file validation and email-draft construction.
- `css/styles.css`, `css/fonts.css`: retained industrial styling and self-hosted Manrope.
- `public/media/gallery/`: six work thumbnails and deferred full-resolution gallery files.
- `GALLERY_IMAGES.md`, `MEDIA_INVENTORY.md`, `MEDIA_PROVENANCE.json`: sources and illustrative-image provenance.

## Tests

```sh
node --check js/script.js
node --check js/render.js
node --check scripts/build.mjs
node --test tests/*.test.mjs
```

There is no separate lint/typecheck configuration. Node tests cover translation/output completeness, required fields, gallery files/deferred loading, phone and file boundaries, email-draft construction and slideshow timing.

For the optional Playwright suite, install/use an available Playwright module and browser. Start the dev server with `BCS_QA=1`; on PowerShell:

```powershell
$env:BCS_QA='1'
node scripts/serve.mjs
```

Then run `node tests/browser.mjs` in another terminal. Optional environment variables: `PLAYWRIGHT_MODULE` (module URL) and `BROWSER_EXECUTABLE` (browser path). The `/__qa/` fixture observes real slideshow transitions and intercepts validated drafts before an email client opens. It is not included in `dist/` and is disabled without the QA flag. The shared `tests/connected-browser.mjs` checks were also executed through the connected browser because standalone Edge launch failed in the desktop sandbox. See `UPDATE_REPORT.md` for actual results; no unexecuted suite is marked passed.

Hero-specific QA: `/__qa/hero/` records actual seven-second cycles. Append `?video=1` for a small synthetic canvas-recorded WebM, or `?video=fail` for intentional video failure/poster fallback. These fixtures and clips are test-only and never included as company footage. Current hero results and limitations are in `HERO_ANIMATION_REPORT.md`; evidence is under ignored `work/qa-hero/`.

## Release

Work is on `fix/bcs-steel-website-updates`. Nothing is deployed automatically. Review `UPDATE_REPORT.md` and `GIT_HANDOFF.md` before an independently authorized release. Production hosting should serve the contents of `dist/` with directory indexes and media MIME types. Canonical domain remains `https://bcslasercut.eu/`.
