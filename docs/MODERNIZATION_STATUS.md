# Modernization status — 2026-10-25

Prepared locally in `narcisiwe/BCS-Steel` from commit `860de957bc2a6b333a8fe1c2dbc62c49f2b07892`. No commit, push, deployment, or replacement with imported legacy media was performed.

## Implemented
- Preserve all original page sections, original `img/` assets and the dark/orange identity.
- Content-driven hero height, room for the longest slide title, 320 px form containment, anchor offsets, mobile navigation at content-safe widths.
- Menu expanded state, Escape/outside close, keyboard focus, skip link, active navigation and larger slide targets.
- User pause, manual-selection pause, reduced motion, viewport/visibility/focus pause and cancellation of pending slide transitions.
- LV/RU/EN static pages and metadata, canonical/hreflang, sharing metadata, organization JSON-LD, sitemap, favicon reference and persistent shareable language routes.
- Translate placeholders, alternative text, menu and slideshow labels. Stable service values across languages.
- Higher-contrast dark text on existing orange buttons; readable form placeholders and 16 px inputs.
- Lazy loading, intrinsic dimensions and downscaled WebP variants of existing images, retaining every original.
- Explicit email fallback and configurable HTTPS multipart submission with file limits, timeout, disabled repeat submissions, error/retry and acceptance states. No endpoint has been invented.
- Repository AGENTS.md and a global AGENTS.md in this cloud instance, matching docs/AGENTS.global.md. This does not configure the user's other devices.
- Dependency-free source checks and CI for pull requests/manual runs. Existing Playwright and Chromium are used locally; no dependency installation.

## Validation
- 6 repository tests passed: page/asset references, duplicate attributes/IDs, deterministic locale generation, JS syntax, sitemap, preservation of page media references and exact imported-file hashes.
- 9 browser scenarios passed with blocked fonts (fallback), and again with real Inter available: 11 widths × 3 languages × 4 slides, mobile menu/focus/anchors, locale URL/reload/no-JS, reduced motion, visibility/pause/interruption, explicit email fallback, mocked multipart acceptance with a drawing, and rejected/invalid-upload handling.
- Loaded Inter 400/700/800/900 faces were confirmed separately.
- Desktop/tablet/mobile screenshots inspected. No uncontrolled visual polishing or redesign.
- Mocked acceptance proves client behavior only, not delivery to a mailbox. Local Chrome is not a substitute for physical iOS/Android and other browser engines.

## Legacy media
- Public EN root, LV, RU and DE checked via HTML and browser after scrolling/lazy loading.
- 75 linked/nested CSS/JS documents inspected, including two Bitrix CDN bundles. Runtime media URLs add no new photographic candidates beyond the manifest.
- 20 photographs saved unchanged (3,124,253 bytes): 7 equipment/process and 13 projects/products. Largest linked variants selected by measured dimensions; exact duplicates omitted.
- The largest accessible photograph sizes range from 612×816 to 1350×1350. These are website-published originals/exports, not a claim about unavailable camera originals. One unsuffixed original-name probe returned 404.
- One YouTube reference found: https://www.youtube.com/watch?v=vmWiE-sH-r0. A direct MP4 or press-brake-specific video has not been verified. The player/oEmbed is blocked by network CONNECT 403; yt-dlp is not installed, and separate installation approval is pending. Do not label the clip as press-brake footage until inspected.
- `MEDIA_INVENTORY.md` lists URLs, dimensions, bytes, statuses and blockers; `public/media/media-manifest.json` adds hashes and provenance. `public/media/browser-discovery.json` records runtime sources.

## External prerequisites and deliberately outstanding items
1. Owner-approved endpoint, confirmed recipient and actual receipt of a test drawing are needed to finish P0 online delivery. The legacy site displays `bcslasercut@gmail.com`, while the new source uses `info@bcssteel.lv`; do not silently substitute either address. `docs/FORM_SETUP.md` defines the integration contract.
2. Accurate privacy/processor/retention information must come from the owner before enabling online personal-data collection.
3. Video download requires usable YouTube access and an approved extractor, or a supplied original file/direct URL. No transcoding is necessary for direct streams; separate audio/video may require stream-copy remuxing.
4. No dependencies such as Lighthouse, axe, ESLint or Stylelint were installed. Automated WCAG certification, real-user Core Web Vitals, Safari/Firefox and physical-device performance have not been claimed. CI has been authored and locally equivalent checks passed; GitHub-hosted CI has not been run.
5. P2 editorial claims (24h, ±0.1 with missing unit) and Unicode icon replacements require product/content approval. Existing factual claims and identity were preserved.
6. `robots.txt` is included in this project but crawlers consult the origin-root `/robots.txt`; a GitHub Pages project cannot alone set policy for the entire `narcisiwe.github.io` origin. Sitemap URLs are valid project URLs.
7. Repository changes remain local for review; network settings were saved as a draft, not published. No live-site release is authorized implicitly by this work.
