# BCS Steel motion — 2026-11-11

## Direction
Keep the existing industrial photography, dark/orange identity and all content. One focal sequence: a viewport-sized hero with scroll-bound photographic zoom, an inset frame and a slight heading displacement, handing off to the services section. Supporting motion explains section hierarchy, slide changes, navigation and hover/focus feedback.

The requested reference is https://motion.dev/examples/react-scroll-zoom-hero. This URL returned network-proxy CONNECT 403 in the development environment. Its animation and source could not be inspected, so this is an independently implemented interpretation of scroll-zoom, not a verified copy or extracted Motion code. The domain was added to the network configuration draft; saving the draft does not publish the site or activate network changes.

## Implementation
- `js/motion.js`: optional progressive enhancement, native scrolling, passive scroll events and a single coalesced requestAnimationFrame; no perpetual animation loop or dependency installation.
- Desktop pin: width >1050 px, height ≥740 px, and all hero content must fit the viewport. Scroll travel is 65% of viewport height, capped at 620 px. An explicit stage content height bounds CSS sticky; bottom padding alone does not.
- Photo scale: 1.025 → 1.215, inset frame 0 → 28 px and radius 0 → 22 px. Zoom reverses with scroll. Mobile/short windows use 45% strength and no sticky extension; access to content is not delayed.
- Headings: intact semantic H2 elements, a 650 ms clipped baseline reveal once per visit; no word splitting, duplicate headings or hidden default content. Images have a quiet 600 ms transition; service-card siblings stagger by 55 ms.
- Slide title: cancelable 440 ms transition with 45 ms separation between existing lines. Rapid clicks cancel previous effects. Slide/translation geometry and the original pause behavior are preserved.
- Navigation underline, reading-progress line, scrolled header, button arrows and card-image feedback share the existing palette.

## Accessibility and fallback
- Reduced motion removes pinning, zoom, spatial transitions, menu animation and hover movement; existing carousel autoplay is also disabled by the established controller.
- Focus cancels animations on a focused target; text and links do not depend on completed animations.
- Motion effects pause when the document is hidden. Heading/image effects run once; there is no offscreen loop.
- No scroll interception, forced snapping, pointer tracking, expensive full-screen blur, or permanently set will-change.
- Without JavaScript or when motion.js fails, all content is visible in the original document flow. Without IntersectionObserver/WAAPI, section reveals fall back to static content.
- The external quote endpoint remains unconfigured, as documented in FORM_SETUP.md. Motion work does not imply mailbox delivery.

## Validation
Existing source and browser checks are retained. New browser coverage checks actual sticky position, increasing/reversible zoom, dynamic reduced-motion reset with no leftover scroll spacer, language changes after a heading reveal, and a failed optional motion.js request. Test failures are not replaced with visual assertions: sticky must remain at y=0 during its pin interval.

Desktop and mobile views, the intermediate zoom state and the services handoff were inspected in Chromium. Physical-device GPU/frame-rate behavior and Safari/Firefox have not been measured. No deployment or imported-media substitution was performed.
