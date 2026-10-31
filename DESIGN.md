---
name: "BCS Steel"
description: "Restrained industrial confidence through photography, charcoal surfaces and precise orange signals."
colors:
  accent: "#ff7900"
  accent-hover: "#ff9638"
  bg: "#0b0f14"
  secondary: "#151b22"
  card: "#1c242d"
  text: "#ffffff"
  muted: "#a8b3bf"
  border: "#303a45"
  error: "#ffb6a0"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(56px,6.1vw,94px)"
    fontWeight: 650
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(32px,3.4vw,50px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body-intro:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.9
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 750
rounded:
  square: "0px"
spacing:
  card-gap: "22px"
  section: "110px"
  section-tablet: "80px"
  section-mobile: "65px"
  gutter: "56px"
  gutter-tablet: "32px"
  gutter-mobile: "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#121416"
    rounded: "{rounded.square}"
    padding: "17px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-icon:
    width: "44px"
    height: "44px"
    backgroundColor: "transparent"
    rounded: "{rounded.square}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "13px 14px"
  product-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.square}"
  product-card-body:
    padding: "26px"
---

# Design System: BCS Steel

## Overview

**Creative North Star: "The Precision Workshop"**

Manufacturing photography carries the atmosphere: steel, machinery, scale and controlled light. Manrope supplies a calm, precise voice over charcoal surfaces, with generous section spacing and a clear hierarchy of large headings and compact supporting detail.

The website uses one consistent dark theme. The original company logo remains intact. LV, RU and EN share the visual system and must retain legibility as copy length changes.

**Key Characteristics:**
- Dominant industrial photography with cinematic shading.
- Large restrained type and wide section hierarchy.
- Square geometry, flat tonal layers and sparse orange signals.
- One dark system across LV/RU/EN.

## Colors

Cool industrial neutrals meet a warm, deliberately scarce action signal. Frontmatter values are normative; CSS custom properties define the single dark palette.

### Primary

- **Safety Orange** (accent): primary fills, active hero progress, accent text and focus.
- **Warm Orange** (accent-hover): primary button hover.

### Neutral

- **Workshop Charcoal**, **Machine Housing** and **Steel Panel** (bg, secondary, card): page, alternate sections and product containers.
- **White**, **Cool Steel** and **Seam Grey** (text, muted, border): primary copy, supporting detail and structural dividers.
- Hero imagery remains dark with white copy.
- Error ink is reserved for validation.

**The Signal Rule.** Reserve orange for primary actions, active navigation, progress, small process markers and focus. Let imagery and neutral surfaces occupy the broad areas.

## Typography

**Display and Body Font:** Manrope, with Arial and sans-serif fallbacks. The locally hosted variable font spans weights 200–800; Latin extended and Cyrillic subsets support the language set. There is no second display or monospace family.

- **Display:** desktop hero follows the display token. Existing overrides use 72px below 1200px, 64px below 1000px and clamp(40px,10vw,62px) below 700px.
- **Headline:** section headings use the headline role; mobile sections use 34px, with about at 36px.
- **Title:** service/equipment titles use the title role; product titles use 20px. Mobile service titles use 16px.
- **Body:** section introductions use body-intro. Hero introduction is 17px/1.8, becoming 14px on mobile; card detail is 12px and mobile service detail 11px.
- **Label:** actions use the label role; navigation uses 12px/600 and form labels 11px/600. Preserve localized wrapping.

## Layout

The centered container tops out at 1320px with 56px side gutters, becoming 32px at 1200px and 20px at 700px. Section rhythm follows the spacing tokens. Heading rows have an 80px gap and 48px lower margin, stacking on mobile.

Services use four columns then two at 1000px. Equipment uses three columns, becoming single rows with a 40% image column at 700px. Products show three cards, two below 1000px and an 86%-width card below 700px, preserving the next-card cue. About and contact are two-column layouts that stack at 700px. Form fields remain paired where they fit.

The hero is viewport-scale with a desktop minimum of 720px; mobile uses an 850px composition with room for copy, actions and controls. Capture the hero at page top to evaluate the absolute header in its intended state.

## Elevation & Depth

The system is flat and has no box-shadow vocabulary. Tonal surfaces, fine borders, photographic perspective and dark image overlays provide depth. The header overlays imagery and becomes a near-opaque charcoal fixed surface after scrolling.

**The Tonal Depth Rule.** Use surface changes, image shading and fine dividers for hierarchy; do not add decorative card shadows.

## Shapes

Square corners define buttons, cards, fields and icon controls. Fine borders are structural seams. Images crop cleanly with object-fit cover. Service arrows use small orange squares over imagery; product captions use compact dark rectangles.

## Components

### Buttons

Primary controls use orange fills, dark lettering, square corners and a minimum 56px height. Hover warms the fill and lifts 2px over 0.2s. Text links remain unboxed; their arrow shifts 4px over 0.25s. Icon buttons have a fine border and transparent fill; hover adds orange edging and a faint orange wash. Disabled controls use 0.4 opacity. Focus is a 2px outline offset 5px, in orange.

### Cards / Containers

Services are image-led and unboxed, with copy below. Products use card surfaces, a 1.35 image ratio and padded bodies. Equipment uses secondary surfaces and ruled specification lists. Hover image scaling is slight (1.04–1.045), clipped to imagery, with stable geometry. Illustration captions and the shared disclosure remain visible.

### Inputs / Fields

Fields use page backgrounds inside a secondary-surface form, fine borders and square corners. Focus follows the shared outline and caret uses orange. Files have a dashed outer frame and a localized visible selector. Consent is explicit; validation uses the dark error ink and status a fine orange border. Submission prepares an email draft, retaining attachment guidance without claiming automatic delivery.

### Navigation

The original logo and STEEL wordmark sit left; compact links and LV/RU/EN controls sit right. Active desktop links gain an orange underline. Header height is 98px over imagery and 80px when fixed; below 1000px a vertical menu opens under an 80px header. Language selection uses aria-current and orange. In-place language changes preserve the current slide and form input.

### Hero and Product Carousels

The hero has four photography/video-capable slides, image fallbacks, a 1.2s crossfade, subtle 10s image settling and an 8s progress line driven by the same JavaScript clock as slide changes, without a separate CSS progress animation. Keep previous/next, direct selection and pause controls. Text changes use a 0.65s eased entrance. Products use horizontal scroll snapping and explicit arrow controls. Reduced motion removes animation, transitions and smooth scrolling.

### About galleries

Two horizontal scroll-snap tracks inherit the existing square-cornered industrial imagery, showing two images across on desktop and a 90%-width image on mobile. Previous/next controls accompany each track. Captions distinguish real company photographs from product illustrations. Native modal lightboxes support Escape, arrow keys and focus return. Full-resolution sources load on demand.

## Do's and Don'ts

### Do:
- Do preserve the original logo and locally hosted Manrope across Latin and Cyrillic content.
- Do keep photography dominant and legible shading behind hero copy.
- Do retain the dark palette and visible orange keyboard focus.
- Do preserve keyboard focus, reduced motion and readable multilingual wrapping.
- Do describe the contact action as an email draft and preserve illustration disclosures.

### Don't:
- Don't turn orange into a broad section background.
- Don't add pill controls, soft card shadows or a competing display font.
- Don't remove pause/manual carousel controls or make essential content depend on animation.
- Don't present illustrative imagery or email drafts as verified production output or delivered inquiries.

