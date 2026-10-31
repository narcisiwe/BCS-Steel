# BCS Steel development rules

- Keep the dependency-free static HTML/CSS/JavaScript architecture. Build with Node 20+.
- Latvian is the default language; maintain LV, RU and EN together in `js/content.js`.
- Preserve the original logo. Use the brief's dark industrial palette and restrained orange.
- Company facts must come from verified company sources. Do not add certifications, tolerances, lead times or equipment models without evidence.
- The only service categories are laser cutting, sheet metal bending, TIG/laser welding and custom stainless steel fabrication.
- Keep generated product imagery labeled as illustrations in every locale.
- Never pretend that the email draft form uploads files or delivers an inquiry. A backend requires server-side validation and delivery tests before enabling online submissions.
- Video sources belong in `js/media.js`; never infer downloadable footage from an embedded player. Keep poster fallbacks and reduced-motion/data-saving behavior.
- Run `node scripts/build.mjs`, `node --test tests/*.test.mjs` and syntax checks before handoff. Do not deploy production or force-push.
- Work on `fix/bcs-steel-website-updates`; preserve unrelated changes. Generated `dist/` is ignored.
- Preserve the existing dark-only visual design. Do not reintroduce theme controls or stored theme state.
- Keep slideshow progress and slide transitions on the single `slideshow-clock.js` timeline. Verify at least two real automatic cycles after scheduler changes.
- Keep in-place locale switching and all controls operational under nested static-hosting paths.
- HSG G3015X replaces the previous laser machine; omit unverified specifications.
