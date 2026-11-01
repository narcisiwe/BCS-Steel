# BCS Steel — progress restoration and GSAP carousels

Implemented locally on 1 November 2026. Nothing deployed or pushed.

## Progress indicator findings

Git history was inspected, including the imported redesign at `fb94c66`. Its working visual was a one-pixel translucent gray track and a two-pixel orange fill beneath each service title. It used an independent eight-second CSS animation. That animation could finish without advancing the slide because it did not own slide switching.

The current checkout already had a seven-second shared JavaScript clock introduced by earlier fixes. The reported disappearance was **not reproduced** in the served current build; no unsupported deployed/cache-specific root cause is asserted. Restored the original one-pixel track/two-pixel orange appearance without restoring the independent CSS timer. The existing single `slideshow-clock.js` timeline still owns progress, automatic switching, looping, pause and reset. Neither the hero component nor its content/media configuration was reverted.

Actual browser measurements showed an active orange fill (`rgb(255,121,0)`) two pixels high, with a changing `scaleX`, while inactive fills remained zero. The browser recorded `0,1,2,3,0,1,2,3,0` at approximately seven-second intervals. The clock tests verify exact 0/100% endpoints, reset, pause/resume and two cycles.

## Carousel implementation

The two existing About image galleries now use original elliptical positioning with local GSAP core. Front panels travel left to right. A linear, repeating tween advances an independent phase driver; trigonometric transforms position the panels with restrained perspective, depth, shading and rounded corners. Only transforms, stacking and a shading opacity change per frame. Layout measurement occurs on resize, not each animation frame.

`data-seconds="50"` configures a revolution in the shared renderer. Each instance has its own tween, manual transition, pause state and one resettable ten-second inactivity timer. Pointer entry/movement, drag, touch pointers, focus and navigation suspend automatic rotation. Rotation resumes from the current phase after inactivity, provided focus/drag and other pause reasons have cleared. No per-image autoplay stops or phase resets. Manual arrows use a short GSAP transition; reduced-motion arrows update immediately. A persistent pause button is also provided.

Dragging suppresses the following click; ordinary image clicks retain the full-resolution lightbox. Keyboard focus brings a panel forward without moving it on ordinary mouse focus. Hidden pages, offscreen tracks and open lightboxes suspend autoplay. Locale switches restore phase, explicit pause and the inactivity deadline. Destroy aborts listeners, disconnects observers, clears the timer and kills both GSAP tweens.

The hero and galleries share no animation clock or index state. The fabrication category cards remain unchanged.

## Images and dependency

Reused the six real work photographs in the first gallery and eight existing product concepts in the second. Illustrations retain their labels and disclosure in LV/RU/EN. No new company-project claims or certifications were added. Available images do not cover every requested subject separately; no supplied asset was relabeled to imply otherwise.

Added exactly pinned `gsap@3.15.0` and `package-lock.json`. No extra animation plugins are loaded. The build copies only GSAP core and its supplied README into `js/vendor/`; the minified core retains its upstream copyright/license header. Production uses local files, not a CDN. The implementation follows the official [GSAP tween API](https://gsap.com/docs/v3/GSAP/gsap.to%28%29/). Run `npm ci` before building a fresh checkout. The environment lacked npm, so npm tooling was bootstrapped in the temporary directory; Windows system certificates were used for installation.

## Tests actually executed

- Production build passed; JavaScript syntax checks and `git diff --check` passed.
- All **17 Node tests passed**, including exact hero timing/endpoints and locale lifecycle behavior.
- Real connected browser: two complete automatic hero cycles, all four headings and visible progress-fill measurements.
- Real browser carousel fixture: full 50-second revolution, seamless wrap, pointer pause, synthetic touch-pointer drag, click suppression, resettable inactivity deadline, ten-second resume, arrows, focus hold, image lightbox, locale phase/pause preservation and independent second-gallery rotation: **12 checks passed**. During the full revolution the measured phase advanced 1.02412 turns over 51.2 seconds, with maximum 100-ms sample delta 0.0022 turns.
- Real browser reduced-motion/lifecycle fixture: disabled autoplay, immediate manual navigation, listener removal after destroy, phase restoration and inactivity restoration: **5 checks passed**. This fixture supplied a reduced-motion media-query object; it did not change the user's OS preference.
- LV/RU/EN at actual viewport widths **375, 768, 1024, 1440 and 1920**: all 15 combinations had two enhanced galleries and no horizontal document overflow.
- Desktop/mobile screenshots inspected. A fresh final production preview had no captured console warnings or errors. Real keyboard and pointer arrow controls were exercised through browser automation.

Fixtures are under `tests/` and served only with `BCS_QA=1`: `/__qa/hero/`, `/__qa/carousel/`, `/__qa/carousel-reduced/`. They are excluded from `dist/`.

## Modified files

- `js/carousel.js`: reusable GSAP controller.
- `js/script.js`: gallery lifecycle, locale snapshots and lightbox pause integration.
- `js/render.js`: local GSAP script, gallery pause controls, speed configuration and section anchor.
- `css/styles.css`: restored progress appearance and responsive 3D panel layout.
- `package.json`, `package-lock.json`, `js/vendor/gsap.min.js`, `js/vendor/GSAP-README.md`: pinned dependency and local runtime.
- `scripts/build.mjs`, `scripts/serve.mjs`: dependency packaging and development-only QA routes.
- `tests/carousel-fixture.html`, `tests/carousel-reduced.html`: browser interaction and lifecycle checks.
- Generated `index.html`, `ru/index.html`, `en/index.html`.
- `.gitignore`, `AGENTS.md`, `README.md`, `DESIGN.md`, this report: dependency workflow and motion documentation.

## Remaining limitations

The screenshot mentioned in the brief was not attached; the carousel follows the written curved-panel reference description, with original code. Touch-pointer tests were synthetic, not a physical phone test. Actual background-tab suspension was not independently established through this browser provider; visibility/offscreen lifecycle handling is implemented. No cross-browser/device performance certification is claimed.

Company video sources remain unconfigured (`js/media.js` contains null video values), as before; posters and the video-capable hero engine are preserved. No company video playback claim is made. No deployment, GitHub push or production inquiry was performed.
