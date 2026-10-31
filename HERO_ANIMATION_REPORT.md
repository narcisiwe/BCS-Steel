# BCS Steel — hero animation upgrade

Implemented directly in the existing project on `fix/bcs-steel-website-updates`. Existing industrial design, Manrope typography, orange accents, navigation, four service slides and company media are preserved. No new dependencies or animation library. No deployment.

## Root-cause findings

The reported total absence of progress could not be reproduced in this checkout over HTTP: the baseline's custom property and pseudo-element transform advanced in the browser. A deployed/cache/local-file-specific cause was not independently established and is not asserted as fact.

Two source-level deficiencies were confirmed. The clock reset to the next slide before publishing a 100% endpoint, and the background's separate ten-second CSS animation was not synchronized with the eight-second slide clock or Pause. Text entrances also lacked the requested staggering. The revised implementation uses explicit progress-fill elements and publishes the endpoint before resetting; one seven-second clock now owns slide index, elapsed time, progress, overlap state and slideshow motion. HTTP serving remains required for ES modules; opening `index.html` with `file://` is not a supported preview method.

The Facebook reference could not be fetched. A native browser access attempt timed out waiting for app approval. The reel was not viewed or copied; motion follows the user's written specification.

## Modifications

- Seven-second slide duration; exact endpoint publication and active-only orange fills over subtle gray tracks.
- One RAF clock for progress, 1100 ms overlapping background transition, image pan/zoom and copy timing. An opaque outgoing layer remains beneath the incoming layer to avoid a dark gap.
- Alternating linear Ken Burns movement: desktop scale 1.03–1.12 with small horizontal/vertical drift; mobile reduces zoom to 1.03–1.075 and shortens travel. Video keeps native playback, cover sizing and no extra zoom.
- Heading entrance: 700 ms and 24 px upward movement; description begins after 150 ms and CTA group after 250 ms. Only opacity and transforms change during animation. Largest localized heading/description blocks are reserved on initialization/font/viewport changes, keeping the content block stable.
- Pause freezes elapsed progress, overlap, image movement, copy motion and active video playback. Play resumes remaining time. Manual navigation resets progress and remains visible when paused. Hidden/offscreen state and lightboxes suspend the clock. Old runtimes cancel their RAFs/listeners/observers.
- Language switching retains active index, elapsed time, overlap and paused/manual-entry state.
- Active and next poster preparation; video sources are assigned only to the active video. Muted inline autoplay, inactive pausing, buffering/error poster fallback and stale async-load guards remain.
- Reduced motion disables automatic cycling and Ken Burns/copy movement while allowing a short 200 ms manual fade.
- A narrow-screen Russian heading size adjustment fixes a long-word overflow found when testing every slide at 375 px. The font family, weight and design remain unchanged.

Video readiness/fallback uses a small CSS opacity dissolve; **slideshow motion** is clock driven. That readiness dissolve can finish during pause even while video playback itself is frozen.

## Files changed

- Added `js/hero.js`; updated `js/slideshow-clock.js`, `js/script.js`, `js/render.js`, `css/styles.css`.
- Regenerated `index.html`, `ru/index.html`, `en/index.html` through the existing build.
- Expanded `tests/slideshow.test.mjs`; added `tests/hero-fixture.html` and QA-only routes in `scripts/serve.mjs`.
- Updated `README.md`, `DESIGN.md` and `.impeccable/design.json`; added this report.
- `js/media.js` and all existing images/video configuration are unchanged.

## Executed tests

| Check | Result |
| --- | --- |
| Production build | Passed |
| Node syntax checks | Passed for hero/runtime/clock/server modules |
| Automated Node suite | 17 passed, 0 failed |
| Actual automatic cycles | DOM observer recorded `0,1,2,3,0,1,2,3,0`, with actual localized heading changes at approximately seven-second intervals |
| Visible progress | Browser measured the fill advancing from about 3% to 34% over 2.1 seconds; inactive fills remained zero; reset behavior and exact endpoints covered by tests |
| Pause/resume | Browser confirmed identical progress, image transform and synthetic-video playback time while paused; resumed active video played and inactive video stayed paused |
| Paused manual navigation | Immediately displayed the selected background and heading at zero progress while autoplay remained paused |
| Video playback | Synthetic test-only WebM played with `muted=true`, `playsInline=true`, readyState 4 and `object-fit:cover`; only the active video initially received a source |
| Failed video | Intentional failure retained a loaded, opaque poster while progress continued |
| Language during transition | RU switch retained index 2, ongoing crossfade and increasing elapsed progress rather than resetting |
| Responsive matrix | 60 checks: LV/RU/EN × all four slides × 375/768/1024/1440/1920 px; no page overflow after the Russian heading correction |
| Content-block position | Stable within one pixel across all slides for every tested language/width |
| Reduced motion | Automated clock test: autoplay/progress held, manual 200 ms fade completed; no OS preference was changed |
| Visibility | Automated tests freeze/resume hidden-state elapsed time; the connected browser kept documents visible across its tabs, so it did not provide a true hidden-tab hardware test |
| Console | No production-page errors/warnings observed in the final responsive run and captures; intentional missing-video fixture requests are expected failures |
| Independent review | Ship; no material design regression found in desktop/mobile captures and source/evidence review |

Evidence JSON and screenshots: `work/qa-hero/` (ignored by Git). Tests used the connected browser's Playwright API. No unexecuted standalone suite is reported passed.

## Remaining limitations

Production still has no direct company video clips configured: all four `video` values in `js/media.js` are null. Synthetic playback demonstrates the engine, not real company footage. Add authorized optimized clips before claiming production-video playback verified. Existing poster assets are retained. Physical-device swipe/autoplay and true OS/browser reduced-motion or hidden-tab behavior were not independently tested; touch handlers, responsive viewports and clock behavior were checked as described above.

## Preview

From the repository directory:

```sh
node scripts/build.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/`. No project dependencies need installation. The review ZIP contains the static `dist/` build and must be served over HTTP. No production deployment was performed.
