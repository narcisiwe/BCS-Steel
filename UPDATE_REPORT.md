# BCS Steel — fixes and content update

Completed against the previous redesign, imported into this checkout after the user's explicit baseline choice. Branch: `fix/bcs-steel-website-updates`. The initial older checkout and ZIP were inspected before choosing the baseline. No production deployment.

## Changes

Preserved the hero composition, typography, orange accents, dark surfaces, card styling and existing media. Fixed automatic hero timing, progress, previous/next, direct selection and pause/play. Updated the project-cycle, drawing/sketch, fabrication and About content professionally in LV/RU/EN, including pharmaceutical applications without certification claims. Replaced the laser machine name with HSG G3015X and removed the former machine's specifications. Removed duplicate service-card text CTAs while retaining labeled, keyboard-accessible image links and main CTAs. Added two horizontal About galleries and native dialog lightboxes. Made name/email/phone/description required and company optional. Removed light-theme controls, code, styles and legacy stored theme preference.

## Hero bug root cause

The imported runtime's `canAnimate()` required both `hovered` and `focused` to be false. Entering the large hero with the pointer stopped the JavaScript timeout; interacting with a hero control left focus in the hero, which also blocked scheduling. Play only cleared the user-pause flag, so it could not override retained focus. Separately, the CSS progress animation did not share the timeout's elapsed/remaining state. Repeated scheduling reset a full timeout without resetting the CSS animation. That combination explains a stalled slide and progress that could disagree with content.

The fix uses a single requestAnimationFrame timeline for elapsed time, transitions and the CSS progress value. There is at most one scheduled frame. Manual navigation resets elapsed time; Pause freezes it and Play resumes the remaining duration. Hover/focus no longer silently disable automatic playback. Document visibility, offscreen state, reduced motion and an open lightbox are explicit suspension reasons. Cleanup cancels the old clock when switching language.

## Language bug explanation

The imported design used relative links to separate `/ru/` and `/en/` directories rather than switching content in place. Those destinations depended on publishing every generated locale directory under the expected base. It wrote a localStorage choice but never read it. The earlier checkout in this workspace was a different version that also always initialized LV. These are verified source-level issues; the exact files previously uploaded to the user's hosting were not inspected, so a specific missing-folder deployment is not asserted as fact.

The new controls use the shared renderer in place, with a deployment base derived from the module URL. They update all visible content, labels, `html.lang`, title and metadata, persist the choice, and preserve the current slide and form/attachment data. Every old runtime listener/observer/clock is disposed before initializing the new localized DOM. Static localized pages remain generated for SEO. New visitors without a stored choice or explicit locale receive LV.

## Modified files

- `js/script.js`, `js/content.js`, `js/validation.js`, `css/styles.css`.
- Added `js/slideshow-clock.js`, `js/render.js`, `js/gallery-data.js`; removed `js/theme.js`.
- `scripts/template.mjs`, `scripts/serve.mjs`; regenerated `index.html`, `ru/index.html`, `en/index.html`, `robots.txt`, `sitemap.xml`.
- Added `tests/slideshow.test.mjs`, `tests/connected-browser.mjs`, `tests/fixture.html`; updated `tests/site.test.mjs`, `tests/browser.mjs`.
- Added `public/media/gallery/` thumbnails and full-resolution lightbox assets.
- Updated `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `README.md`, `.gitignore`, `MEDIA_INVENTORY.md`, `MEDIA_PROVENANCE.json`; added this report and `GALLERY_IMAGES.md`.

The imported redesign was committed separately from this fix so its baseline and the requested update remain reviewable.

## Gallery image list and sources

Six new gallery thumbnail files (`work-0.webp` through `work-5.webp`) derive from the original company website photographs already retrieved in the previous turn. Eight existing product illustrations are reused with newly optimized, full-resolution lightbox derivatives (`product-0.webp` through `product-7.webp`). No new images were generated in this update. `GALLERY_IMAGES.md` lists the source of each image, original URL or generated source, dimensions, size and full-resolution path. Real company work and illustrative product concepts remain visibly distinguished in all three languages. A combined container example covers food/pharmaceutical applications without representing a certified product.

## Executed verification

| Check | Actual result |
| --- | --- |
| Production build | Passed; all three static language pages and assets generated |
| Node syntax checks | Passed for interaction, shared renderer and build/test scripts |
| Node automated tests | 12 passed, 0 failed |
| Actual automatic hero cycles | Passed: DOM observer recorded `0,1,2,3,0,1,2,3,0`; approximately eight seconds per transition with actual localized heading changes and progress near zero after each change |
| Pause/play | Passed: slide and progress stayed identical through nine seconds paused; Play advanced the actual content after resuming |
| Manual hero controls | All four indicators, previous and next passed during six repeated locale changes |
| Language switching | RU → EN → LV → EN → RU → LV passed with localized gallery, form, metadata and accessibility content; existing controls remained functional |
| Galleries/lightboxes | Both tracks' navigation, End/Home keys, image open, next/previous, arrow keys and Escape passed across repeated locale changes |
| Validation | Missing required fields, malformed email, malformed phone and valid international formatting checked in the browser in all three languages |
| Attachments | Browser rejected a non-engineering file; accepted a PDF and preserved its selection through a language change; unit tests cover types, empty files and 10 MiB boundaries |
| Actual valid submit path | Passed through the QA fixture: produced the expected mailto draft to the company address, including the PDF filename; intercepted before launching an email app, so no message was sent or delivery claimed |
| Responsive layout | LV/RU/EN at 375, 768, 1024, 1440 and 1920 px, no page horizontal overflow; mobile menu opens/navigates/closes in all languages |
| Dark theme | No theme control in all 15 layout checks; computed background remained `rgb(11,15,20)` |
| Equipment/content | Static tests confirm HSG G3015X, omitted former specs, required content, no obsolete machine references in rendered pages and no discontinued service text |
| Media/links | Every generated relative resource and gallery thumbnail/full-resolution file exists; full-resolution gallery paths are absent from initial HTML |

The standalone Playwright/Edge runner was attempted but crashed before tests could run in the desktop sandbox. It is not reported passed. The shared browser checks were instead executed through the connected browser. A transient blank-iframe load exposed a null target in the test fixture's observer; a guard was added. Production runtime errors were not observed during the completed checks. Evidence JSON is retained under ignored `work/qa/`.

## Known limitations

- No backend exists. The preserved email-draft flow does not upload drawings or certify delivery. Real email receipt has not been tested.
- The imported redesign has no direct video clips configured; all four `video` values remain null. Existing poster assets and video-capable logic are preserved. Actual footage/autoplay verification requires licensed clips.
- HSG G3015X technical parameters were not independently verified, so none were copied from the former machine. The existing equipment image is a production-detail photo.
- Generated products are temporary illustrative concepts, not completed projects or regulatory certifications.
- Responsive checks used browser viewports; real mobile-device swiping and autoplay were not independently tested. Reduced-motion clock behavior is covered by automated tests; no OS preference was changed during connected-browser QA.
- GitHub push/PR outcome is recorded in `GIT_HANDOFF.md`. No deployment was performed.

## Preview

From this checkout run `node scripts/build.mjs`, then `node scripts/serve.mjs`. Open `http://127.0.0.1:4173/`. No project dependencies are needed. Optional QA-fixture instructions and standalone browser runner configuration are in `README.md`.
