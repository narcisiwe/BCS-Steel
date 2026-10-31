# Git handoff

Branch: `fix/bcs-steel-website-updates`.

The previous redesign was imported in a separate baseline commit after the user's explicit choice, followed by the requested bug/content fixes. No production deployment is authorized or performed.

If the automatic GitHub handoff is unavailable, run from an authenticated terminal:

```sh
git push -u origin fix/bcs-steel-website-updates
```

Then open a pull request into `main`, titled `Fix BCS Steel slideshow, localization and inquiry validation`. The implementation, tests, media provenance and known video/email limitations are described in `UPDATE_REPORT.md`.
