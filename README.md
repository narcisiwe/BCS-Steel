# BCS Steel website

Static website for BCS Steel.

## Structure

```text
BCS-Steel/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ script.js
└─ img/
   ├─ Logo_1.png
   ├─ LaserCut_1.jpg
   ├─ LaserCut_2.jpg
   ├─ FiberLaser_1.jpg
   ├─ Bending_1.jpg
   ├─ Turning_1.jpg
   ├─ Turning_2.jpg
   ├─ Welding_1.jpg
   ├─ hero-laser-cut.jpg
   ├─ hero-turning.jpg
   ├─ hero-bending.jpg
   └─ hero-welding.jpg
```

## Notes

- Default language: Latvian (`LV`).
- Default theme: dark.
- Light theme switcher is hidden/commented for now.
- Hero slideshow uses prepared 1920×760 banner images to avoid stretched photos.
- Upload all files from this folder to GitHub Pages root.

## Development and validation

No build tool or dependency installation is required to serve the site:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

After changing `index.html` or translations in `js/script.js`, regenerate the static LV/RU/EN pages and SEO files:

```sh
node scripts/build-locales.mjs
node --check js/script.js
python3 -m unittest discover -s tests -v
```

When Python Playwright and Chromium are already available, run `python3 tests/browser_checks.py`. This starts an ephemeral local server itself and uses `/usr/bin/chromium` (override with `BCS_CHROMIUM`). It never sends real email. No dependencies are installed by these commands. See `docs/FORM_SETUP.md` for the outstanding live form integration.

`public/media/` contains original legacy-site candidates, not automatically selected page assets. Consult `MEDIA_INVENTORY.md` for acquisition status. Original `img/` files are retained; generated WebP derivatives are smaller, never upscaled. The static server serves `public/` literally; asset links would be `public/media/...`.

No automatic deployment workflow has been enabled. Publishing and further tool installations require explicit approval.

The prepared CI workflow runs dependency-free checks on pull requests and manual dispatch only; it does not deploy. See `docs/MODERNIZATION_STATUS.md` for tested capabilities and external prerequisites. `robots.txt` at this project's path does not control the GitHub Pages origin-root robots policy.

## Motion

`js/motion.js` adds the scroll-zoom hero, heading transitions and interaction feedback without external packages. It preserves native scrolling and falls back to static content. Desktop pinning is enabled only when the hero fits; mobile and reduced-motion behavior differ intentionally. See `docs/MOTION_NOTES.md` for the specification and reference-access limitation.
