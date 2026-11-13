/* BCS motion: scroll is the timeline, never intercepted or replaced.
 * No React/runtime dependency. The HTML remains readable if this file fails.
 */
(() => {
  const stage = document.getElementById('heroScrollStage');
  const hero = document.getElementById('home');
  const header = document.querySelector('.site-header');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !hero || !header) return;

  const animations = new Map();
  let frame = 0;
  let viewport = innerHeight;
  let stageStart = 0;
  let heroHeight = 0;
  let travel = 0;
  let pageRange = 1;
  let measurePending = true;
  let lastProgress = -1;
  let lastReading = -1;
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

  const progressLine = document.createElement('div');
  progressLine.className = 'reading-progress';
  progressLine.setAttribute('aria-hidden', 'true');
  header.append(progressLine);

  // Cancel prior motion on the same element, including a rapid language/slide change.
  function animate(element, keyframes, options) {
    if (preference.matches || !element.animate) return;
    animations.get(element)?.cancel();
    const effect = element.animate(keyframes, { easing: 'cubic-bezier(.16,1,.3,1)', ...options });
    animations.set(element, effect);
    const cleanup = () => { if (animations.get(element) === effect) animations.delete(element); };
    effect.addEventListener('finish', cleanup, { once: true });
    effect.addEventListener('cancel', cleanup, { once: true });
  }

  function measure() {
    viewport = innerHeight;
    stageStart = stage.getBoundingClientRect().top + scrollY;
    heroHeight = hero.offsetHeight;
    // A sticky stage is safe only when every control fits in the visible viewport.
    travel = !preference.matches && innerWidth > 1050 && viewport >= 740 && heroHeight <= viewport + 1
      ? Math.round(Math.min(viewport * .65, 620)) : 0;
    stage.classList.toggle('is-pinned', travel > 0);
    // Sticky is constrained by the parent's content box, not bottom padding.
    const stageHeight = travel ? `${heroHeight + travel}px` : '';
    if (stage.style.height !== stageHeight) stage.style.height = stageHeight;
    pageRange = Math.max(1, document.documentElement.scrollHeight - viewport);
    measurePending = false;
    lastProgress = -1;
  }

  function render() {
    frame = 0;
    if (measurePending) measure();
    const y = Math.max(0, scrollY);
    const reading = clamp(y / pageRange);
    if (Math.abs(reading - lastReading) > .0001) {
      progressLine.style.transform = `scaleX(${reading})`;
      lastReading = reading;
    }
    header.classList.toggle('is-scrolled', y > 36);
    const range = travel || Math.max(1, heroHeight * .85);
    const progress = preference.matches ? 0 : clamp((y - stageStart) / range);
    if (Math.abs(progress - lastProgress) > .0001) {
      // Only bounded compositor transforms and a single photographic clip change.
      const strength = travel ? 1 : .45;
      hero.style.setProperty('--hero-zoom', (1.025 + progress * .19 * strength).toFixed(4));
      hero.style.setProperty('--hero-photo-y', `${(progress * 28 * strength).toFixed(2)}px`);
      hero.style.setProperty('--hero-frame', `${(progress * (innerWidth > 720 ? 28 : 8) * strength).toFixed(2)}px`);
      hero.style.setProperty('--hero-radius', `${(progress * 22 * strength).toFixed(2)}px`);
      hero.style.setProperty('--hero-heading-y', `${(-progress * 30 * strength).toFixed(2)}px`);
      lastProgress = progress;
    }
  }
  function requestRender(measureAgain = false) {
    measurePending ||= measureAgain;
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  // Enter headings from their baseline, like a machined plate clearing a guide.
  // Do not split words/letters: translation and screen-reader semantics stay intact.
  const headings = [...document.querySelectorAll('main h2')];
  headings.forEach(heading => heading.classList.add('motion-heading'));
  const seen = new WeakSet();
  const elements = [...headings, ...document.querySelectorAll('.about-img, .service-card')];
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting || seen.has(target)) return;
      seen.add(target);
      observer.unobserve(target);
      if (preference.matches || target.contains(document.activeElement)) return;
      const isHeading = target.matches('h2');
      const isCard = target.classList.contains('service-card');
      // Stagger a single sibling card list, not every section of the site.
      const delay = isCard ? [...target.parentElement.children].indexOf(target) * 55 : 0;
      animate(target, isHeading ? [
        { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(22px)' },
        { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' }
      ] : [
        { opacity: .65, transform: `translateY(${isCard ? 20 : 30}px) scale(${isCard ? '.985' : '1.015'})` },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: isHeading ? 650 : 600, delay });
    });
  }, { threshold: .12, rootMargin: '0px 0px -24px 0px' }) : null;
  elements.forEach(element => observer?.observe(element));

  hero.addEventListener('bcs:slidechange', event => {
    if (!event.detail.animate || preference.matches || document.hidden) return;
    hero.querySelectorAll('h1 > span, h1 > strong').forEach((line, index) => {
      animate(line, [
        { opacity: .5, transform: 'translateY(16px)', clipPath: 'inset(0 0 70% 0)' },
        { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0% 0)' }
      ], { duration: 440, delay: index * 45 });
    });
    requestRender(true);
  });

  // Keyboard entry must never focus a temporarily clipped/transformed target.
  document.addEventListener('focusin', event => {
    for (const [element, effect] of animations) {
      if (element === event.target || element.contains(event.target)) effect.cancel();
    }
  });
  const reset = () => {
    animations.forEach(effect => effect.cancel());
    animations.clear();
    hero.style.removeProperty('--hero-zoom');
    requestRender(true);
  };
  preference.addEventListener('change', reset);
  addEventListener('scroll', () => requestRender(), { passive: true });
  addEventListener('resize', () => requestRender(true), { passive: true });
  addEventListener('pageshow', () => requestRender(true));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      animations.forEach(effect => effect.pause());
    } else {
      animations.forEach(effect => effect.play());
      requestRender(true);
    }
  });
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => requestRender(true));
    resize.observe(hero);
    resize.observe(document.querySelector('main'));
  }
  document.fonts?.ready.then(() => requestRender(true));
  document.documentElement.classList.add('motion-enabled');
  requestRender(true);
})();
